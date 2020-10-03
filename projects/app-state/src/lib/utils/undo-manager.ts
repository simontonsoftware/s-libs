import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Debouncer } from 's-js-utils';
import { Store } from '../index';

/** @hidden */
export type UndoOrRedo = 'undo' | 'redo';

export abstract class UndoManager<StateType, UndoStateType> {
  private stack: UndoStateType[] = [];
  private currentStateIndex!: number;

  private canUndoSubject = new ReplaySubject<boolean>(1);
  private canRedoSubject = new ReplaySubject<boolean>(1);
  private stateSubject = new ReplaySubject<UndoStateType>(1);

  private currentCollectKey?: string;
  private collectDebouncer = new Debouncer();

  /**
   * An observable that emits the result of `canUndo()` every time that value changes.
   */
  canUndo$: Observable<boolean> = this.canUndoSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * An observable that emits the result of `canRedo()` every time that value changes.
   */
  canRedo$: Observable<boolean> = this.canRedoSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * An observable that emits the current state every time it changes.
   */
  state$: Observable<UndoStateType> = this.stateSubject.pipe(
    distinctUntilChanged(),
  );

  /**
   * @param maxDepth The maximum size of the history before discarding the oldest state. `0` means no limit.
   */
  constructor(
    protected readonly store: Store<StateType>,
    protected maxDepth = 0,
  ) {
    this.reset();
  }

  /**
   * Discard all history and push the current state.
   */
  reset(): void {
    this.currentStateIndex = -1;
    this.pushCurrentState();
  }

  /**
   * Add the current state to the undo history. Any states that could be reached using `redo()` are discarded.
   *
   * @param collectKey When specified, multiple pushes in a row with the same key will be collected into a single undo state. This is useful e.g. for collecting changes from a text input into larger undo states, rather than undoing one character at a time. After a push with a different key or another undo change (like `.undo()` or `.reset()`), collecting will stop and the next push will be in a new undo state.
   * @param collectDebounce If at least this many milliseconds elapse with no other push, the next one will be to a new undo state regardless of its `collectKey`. Defaults to `undefined`, which sets no such timeout.
   */
  pushCurrentState({
    collectKey = undefined as undefined | string,
    collectDebounce = undefined as undefined | number,
  } = {}): void {
    const nextState = this.extractUndoState(this.store.state());
    if (this.currentStateIndex >= 0 && !this.shouldPush(nextState)) {
      return;
    }

    if (collectKey && this.currentCollectKey === collectKey) {
      --this.currentStateIndex;
      this.dropRedoHistory();
      if (!this.shouldPush(nextState)) {
        return;
      }
    }

    ++this.currentStateIndex;
    this.stack[this.currentStateIndex] = nextState;
    this.dropRedoHistory();

    while (this.stack.length > 1 && this.isOverSize(this.stack.length)) {
      this.stack.shift();
      --this.currentStateIndex;
    }

    this.emitUndoChanges(collectKey, collectDebounce);
  }

  /**
   * @returns whether any states are available for `undo()`
   */
  canUndo(): boolean {
    return this.currentStateIndex > 0;
  }

  /**
   * @returns whether any states are available for `redo()`
   */
  canRedo(): boolean {
    return this.currentStateIndex < this.stack.length - 1;
  }

  /**
   * Move backward one step in the history of states saved via `pushCurrentState()`, setting the store to contain that state again.
   *
   * @throws Error when there is no such state (i.e. when `canUndo()` returns false)
   */
  undo(): void {
    if (!this.canUndo()) {
      throw new Error('Cannot undo');
    }

    this.changeState(-1, 'undo');
  }

  /**
   * Move forward one step in the history of states saved via `pushCurrentState()`, setting the store to contain that state again.
   *
   * @throws Error when there is no such state (i.e. when `canRedo()` returns false)
   */
  redo(): void {
    if (!this.canRedo()) {
      throw new Error('Cannot redo');
    }

    this.changeState(1, 'redo');
  }

  /**
   * Drops the state from the internal undo stack that would be applied by a call to `.undo()`. This is useful e.g. if making multiple changes in a row that should be collapsed into a single undo state: call this first before pushing the new version.
   *
   * @throws Error when there is no such state (i.e. when `canUndo()` returns false)
   */
  dropCurrentUndoState(): void {
    if (!this.canUndo()) {
      throw new Error('Nothing to drop');
    }

    this.currentStateIndex = this.currentStateIndex - 1;
    this.dropRedoHistory();
    this.emitUndoChanges();
  }

  /**
   * Returns the current undo state that was most recently pushed or applied. Calls to `undo` will apply the state before this in teh stack, and `redo` will apply the state after this.
   */
  get currentUndoState(): UndoStateType {
    return this.stack[this.currentStateIndex];
  }

  /**
   * Returns a view of the internal undo stack, from oldest to newest. Note that this contains states that would be applied by calls to both `.undo()` and `.redo`.
   */
  get undoStack(): UndoStateType[] {
    return this.stack.slice();
  }

  /**
   * Return the information needed to reconstruct the given state. This will be passed to `applyUndoState()` when the store should be reset to this state.
   */
  protected abstract extractUndoState(state: StateType): UndoStateType;

  /**
   * Reset the store to the given state.
   *
   * The `undoOrRedo` and `stateToOverwrite` parameters can be useful e.g. if a scroll position is kept in the undo state. In such a case you want to change the scrolling so the user can see what just changed by undoing/redoing. To do that, set the scoll to what it was in `stateToOverwrite` when undoing, and to what it is in `stateToApply` when redoing.
   */
  protected abstract applyUndoState(
    stateToApply: UndoStateType,
    undoOrRedo: UndoOrRedo,
    stateToOverwrite: UndoStateType,
  ): void;

  /**
   * Used to determine whether `.pushCurrentState()` actually does anything. Override this e.g. to prevent pushing a duplicate undo state using something like this:
   *
   * ```ts
   * protected shouldPush(state: UndoStateType) {
   *   return equal(state, this.currentUndoState);
   * }
   * ```
   */
  protected shouldPush(_state: UndoStateType): boolean {
    return true;
  }

  private dropRedoHistory(): void {
    this.stack.splice(this.currentStateIndex + 1, this.stack.length);
  }

  /**
   * Each time a state is added to the history, this method will be called to determine whether the oldest state should be dropped. Override to implement more complex logic than the simple `maxDepth`.
   */
  protected isOverSize(size: number): boolean {
    return this.maxDepth > 0 && size > this.maxDepth;
  }

  private changeState(change: 1 | -1, undoOrRedo: UndoOrRedo): void {
    const stateToOverwrite = this.currentUndoState;
    this.currentStateIndex += change;
    const stateToApply = this.currentUndoState;
    this.store.batch(() => {
      this.applyUndoState(stateToApply, undoOrRedo, stateToOverwrite);
    });
    this.emitUndoChanges();
  }

  private emitUndoChanges(collectKey?: string, collectDebounce?: number): void {
    this.canUndoSubject.next(this.canUndo());
    this.canRedoSubject.next(this.canRedo());
    this.stateSubject.next(this.stack[this.currentStateIndex]);

    this.currentCollectKey = collectKey;
    if (collectDebounce !== undefined) {
      this.collectDebouncer.run(() => {
        this.currentCollectKey = undefined;
      }, collectDebounce);
    }
  }
}
