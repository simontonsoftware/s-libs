import { computed } from '@angular/core';
import { Debouncer, isDefined } from '@s-libs/js-core';
import { RootStore } from '../root-store';
import { Store } from '../store';

export type UndoOrRedo = 'redo' | 'undo';

export interface UndoSnapshot<UndoStateType> {
  /**
   * The internal undo stack, from oldest to newest. Note that this contains states that would be applied by calls to both `.undo()` and `.redo`.
   */
  stack: UndoStateType[];

  /**
   * The current index in the undo stack. Calls to `undo` will apply the state before this in the stack, and `redo` will apply the state after this.
   */
  index: number;
}

/**
 * Assists in creating undo/redo functionality. Below is a minimal undo service.
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * class UndoService extends UndoManagerSuperclass<MyAppState, MyAppState> {
 *   constructor() {
 *     super(inject(MyAppStore));
 *   }
 *
 *   protected extractUndoState(state: MyAppState): MyAppState {
 *     // In practice, you'll usually want to track only part of the state...
 *     return state;
 *   }
 *
 *   protected applyUndoState(stateToApply: MyAppState): void {
 *     // ...and restore only those parts here.
 *     this.store.state = stateToApply;
 *   }
 * }
 * ```
 *
 * Then in your app you can simply call `service.pushCurrentState()` after any user interaction to preserve it in the undo stack.
 * ```ts
 * ++myStore('counter').state;
 * undoService.pushCurrentState();
 *
 * undoService.undo(); // sets the store back to 0
 * undoService.redo(); // sets the store to 1 again
 * ```
 */
export abstract class UndoManagerSuperclass<StateType, UndoStateType> {
  /**
   * Emits whether any states are available for `undo()`.
   */
  readonly canUndo = computed<boolean>(() => this.#index.state > 0);

  /**
   * Emits whether any states are available for `redo()`.
   */
  readonly canRedo = computed<boolean>(
    () => this.#index.state < this.#length.state - 1,
  );

  /**
   * Emits the current undo snapshot. Useful if you want to persist this to restore when the user returns to your app later, via {@linkcode #setSnapshot}.
   */
  readonly snapshot = computed(() => this.#store.state);

  /**
   * Emits the current undo state that was most recently pushed or applied. Calls to `undo` will apply the state before this in the stack, and `redo` will apply the state after this.
   */
  readonly state = computed<UndoStateType>(
    () => this.#stack.state[this.#index.state],
  );

  readonly #store = new RootStore<UndoSnapshot<UndoStateType>>({
    stack: [],
    index: -1,
  });
  readonly #stack = this.#store('stack');
  readonly #length = this.#stack('length');
  readonly #index = this.#store('index');

  #collectKey?: string;
  #collectDebouncer = new Debouncer();

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
    this.#index.state = -1;
    this.pushCurrentState();
  }

  /**
   * Reset the entire manager to the given snapshot. Useful combined with persisting the {@linkcode #snapshot} to restore undo history when the user returns to your app.
   */
  setSnapshot(snapshot: UndoSnapshot<UndoStateType>): void {
    this.#store.state = snapshot;
    this.#manageCollectKey(undefined);
  }

  /**
   * Add the current state to the undo history. Any states that could be reached using `redo()` are discarded.
   *
   * @param collectKey When specified, multiple pushes in a row with the same key will be collected into a single undo state. This is useful e.g. for collecting changes from a text input into larger undo states, rather than undoing one character at a time. After a push with a different key or another undo change (like `.undo()` or `.reset()`), collecting will stop and the next push will be in a new undo state.
   * @param collectDebounce If at least this many milliseconds elapse with no other push, the next one will be to a new undo state regardless of its `collectKey`. Defaults to `undefined`, which sets no such timeout.
   */
  pushCurrentState({
    collectKey,
    collectDebounce,
  }: { collectKey?: string; collectDebounce?: number } = {}): void {
    const nextState = this.extractUndoState(this.store.state);
    if (this.#index.state >= 0 && !this.shouldPush(nextState)) {
      return;
    }

    if (this.#prepush(nextState, collectKey)) {
      this.#actuallyPush(nextState, collectKey, collectDebounce);
    }
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

    this.#do('undo', -1);
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

    this.#do('redo', 1);
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

    this.#index.update((i) => i - 1);
    this.#dropRedoHistory();
    this.#manageCollectKey(undefined);
  }

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

  /**
   * Each time a state is added to the history, this method will be called to determine whether the oldest state should be dropped. Override to implement more complex logic than the simple `maxDepth`.
   */
  protected isOverSize(size: number): boolean {
    return this.maxDepth > 0 && size > this.maxDepth;
  }

  #do(undoOrRedo: UndoOrRedo, change: -1 | 1): void {
    const stateToOverwrite = this.state();
    this.#index.update((i) => i + change);
    this.applyUndoState(this.state(), undoOrRedo, stateToOverwrite);
    this.#manageCollectKey(undefined);
  }

  #prepush(nextState: UndoStateType, collectKey: string | undefined): boolean {
    if (isDefined(collectKey) && this.#collectKey === collectKey) {
      this.#index.update((i) => i - 1);
      this.#dropRedoHistory();
      if (!this.shouldPush(nextState)) {
        return false;
      }
    }

    return true;
  }

  #actuallyPush(
    nextState: UndoStateType,
    collectKey: string | undefined,
    collectDebounce: number | undefined,
  ): void {
    this.#dropRedoHistory();
    this.#index.update((i) => i + 1);
    this.#stack.update((stack) => [...stack, nextState]);

    while (this.#length.state > 1 && this.isOverSize(this.#length.state)) {
      this.#stack.update((stack) => stack.slice(1));
      this.#index.update((i) => i - 1);
    }

    this.#manageCollectKey(collectKey, collectDebounce);
  }

  #dropRedoHistory(): void {
    this.#stack.update((stack) => stack.slice(0, this.#index.state + 1));
  }

  #manageCollectKey(key: string | undefined, collectDebounce?: number): void {
    this.#collectKey = key;
    if (collectDebounce === undefined) {
      this.#collectDebouncer.cancel();
    } else {
      this.#collectDebouncer.run(() => {
        this.#collectKey = undefined;
      }, collectDebounce);
    }
  }

  /**
   * Return the information needed to reconstruct the given state. This will be passed to `applyUndoState()` when the store should be reset to this state.
   */
  protected abstract extractUndoState(state: StateType): UndoStateType;

  /**
   * Reset the store to the given state.
   *
   * The `undoOrRedo` and `stateToOverwrite` parameters can be useful e.g. if a scroll position is kept in the undo state. In such a case you want to change the scrolling so the user can see what just changed by undoing/redoing. To do that, set the scroll to what it was in `stateToOverwrite` when undoing, and to what it is in `stateToApply` when redoing.
   */
  protected abstract applyUndoState(
    stateToApply: UndoStateType,
    undoOrRedo: UndoOrRedo,
    stateToOverwrite: UndoStateType,
  ): void;
}
