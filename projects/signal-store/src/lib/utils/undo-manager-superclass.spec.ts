import { effect, inject, Injectable, untracked } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { isEqual } from '@s-libs/micro-dash';
import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { RootStore } from '../root-store';
import { Store } from '../store';
import { UndoManagerSuperclass, UndoOrRedo } from './undo-manager-superclass';

class State {
  object?: never;

  constructor(public counter = 0) {}
}

class TestImpl extends UndoManagerSuperclass<State, State> {
  lastApplicationUndoOrRedo?: UndoOrRedo;
  lastApplicationStateToOverwrite?: State;
  collectKey?: string;
  collectDebounce?: number;

  #skipNextChange = true;

  constructor(store: Store<State>, maxDepth?: number) {
    super(store, maxDepth);
    TestBed.runInInjectionContext(() => {
      effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- read the state so the effect keeps running
        store.state;

        if (this.#skipNextChange) {
          this.#skipNextChange = false;
        } else {
          untracked(() => {
            this.pushCurrentState({
              collectKey: this.collectKey,
              collectDebounce: this.collectDebounce,
            });
          });
        }
      });
    });
  }

  override shouldPush(state: State): boolean {
    // looks pointless, but allows this function to be overwritten below
    return super.shouldPush(state);
  }

  protected extractUndoState(state: State): State {
    return state;
  }

  protected applyUndoState(
    stateToApply: State,
    undoOrRedo: UndoOrRedo,
    stateToOverwrite: State,
  ): void {
    this.#skipNextChange = true;
    this.store.state = stateToApply;
    this.lastApplicationUndoOrRedo = undoOrRedo;
    this.lastApplicationStateToOverwrite = stateToOverwrite;
  }
}

describe('UndoManagerSuperclass', () => {
  let store: RootStore<State>;
  let undoManager: TestImpl;

  beforeEach(() => {
    store = new RootStore(new State());
    undoManager = new TestImpl(store);
    TestBed.tick();
  });

  describe('.canUndo()', () => {
    it('is false (only) when at the beginning of the stack', () => {
      expect(undoManager.canUndo()).toBe(false);

      setCounter(1);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      setCounter(2);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      undoManager.reset();
      expect(undoManager.canUndo()).toBe(false);
    });
  });

  describe('.canRedo()', () => {
    it('is false (only) when at the end of the stack', () => {
      expect(undoManager.canRedo()).toBe(false);

      setCounter(1);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      setCounter(2);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      undoManager.reset();
      expect(undoManager.canRedo()).toBe(false);
    });
  });

  describe('.snapshot()', () => {
    it('works', () => {
      expect(undoManager.snapshot()).toEqual({
        stack: [new State()],
        index: 0,
      });

      setCounter(1);
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1)],
        index: 1,
      });

      setCounter(2);
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1), changedState(2)],
        index: 2,
      });

      undoManager.undo();
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1), changedState(2)],
        index: 1,
      });

      undoManager.undo();
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1), changedState(2)],
        index: 0,
      });

      undoManager.redo();
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1), changedState(2)],
        index: 1,
      });

      undoManager.redo();
      expect(undoManager.snapshot()).toEqual({
        stack: [new State(), changedState(1), changedState(2)],
        index: 2,
      });
    });
  });

  describe('.state()', () => {
    it('works', () => {
      expect(undoManager.state().counter).toBe(0);

      setCounter(1);
      expect(undoManager.state().counter).toBe(1);

      setCounter(2);
      expect(undoManager.state().counter).toBe(2);

      undoManager.undo();
      expect(undoManager.state().counter).toBe(1);

      undoManager.undo();
      expect(undoManager.state().counter).toBe(0);

      undoManager.redo();
      expect(undoManager.state().counter).toBe(1);

      undoManager.redo();
      expect(undoManager.state().counter).toBe(2);
    });

    it('tracks the current undo state', () => {
      const next = jasmine.createSpy();

      TestBed.runInInjectionContext(() => {
        effect(() => {
          next(undoManager.state());
        });
      });
      TestBed.tick();
      expectSingleCallAndReset(next, new State());

      setCounter(1);
      expectSingleCallAndReset(next, changedState(1));

      undoManager.undo();
      TestBed.tick();
      expectSingleCallAndReset(next, new State());

      undoManager.reset();
      TestBed.tick();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('.reset()', () => {
    // most of `.reset()` is tested within the `.can[Un/Re]do()` blocks above

    it('does not affect the store', () => {
      undoManager.reset();

      setCounter(1);
      undoManager.reset();
      expect(store.state.counter).toBe(1);

      undoManager.reset();
      expect(store.state.counter).toBe(1);
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      setCounter(1);

      undoManager.reset();

      // if `collectKey` was still intact, this would not create a new state:
      setCounter(2);
      expectStack(1, 2);
    });
  });

  describe('.setSnapshot()', () => {
    it('sets the internal state', () => {
      undoManager.setSnapshot({
        stack: [changedState(1), changedState(2), changedState(3)],
        index: 1,
      });
      expectStack(1, 2, 3);
      expect(undoManager.state()).toEqual(changedState(2));
    });

    it('clears a pending collectKey', () => {
      // The snapshot is a total reset. We don't want a push from before the snapshot to cause one after to be collapsed.
      undoManager.collectKey = 'k';
      setCounter(1);

      undoManager.setSnapshot({
        stack: [changedState(2)],
        index: 0,
      });

      setCounter(3);
      expectStack(2, 3);
    });
  });

  describe('.pushCurrentState()', () => {
    it('adds to the stack', () => {
      undoManager.pushCurrentState();
      expectStack(0, 0);

      setCounter(1);
      expectStack(0, 0, 1);
      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1);

      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1, 1);
    });

    it('clears the stack after the current index', () => {
      setCounter(1);
      setCounter(2);
      setCounter(3);
      expectStack(0, 1, 2, 3);

      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 1, 2, 2);

      undoManager.undo();
      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 1, 1);

      undoManager.undo();
      undoManager.undo();
      undoManager.pushCurrentState();
      expectStack(0, 0);
    });

    it('can collect multiple changes into a single undo state', () => {
      undoManager.collectKey = 'k1';
      setCounter(1);
      setCounter(2);
      setCounter(3);

      undoManager.collectKey = 'k2';
      setCounter(4);
      setCounter(5);

      expectStack(0, 3, 5);
    });

    it('resets collected changes with no key', () => {
      undoManager.collectKey = 'k1';
      setCounter(1);
      setCounter(2);

      undoManager.collectKey = undefined;
      setCounter(3);
      setCounter(4);

      undoManager.collectKey = 'k1';
      setCounter(5);
      setCounter(6);

      expectStack(0, 2, 3, 4, 6);
    });

    it('can reset collected changes after a timeout', fakeAsync(() => {
      undoManager.collectKey = 'k';
      undoManager.collectDebounce = 1000;

      setCounter(1);
      tick(999);
      setCounter(2);
      tick(1000);
      setCounter(3);
      tick(999);
      setCounter(4);
      tick(1000);
      setCounter(5);
      tick();

      expectStack(0, 2, 4, 5);

      tick(1000);
    }));

    it('can cancel a debounce', fakeAsync(() => {
      undoManager.collectKey = 'k';
      undoManager.collectDebounce = 1000;

      setCounter(1);
      tick(999);
      undoManager.collectDebounce = undefined;
      setCounter(2);
      tick(1000);
      setCounter(3);

      expectStack(0, 3);
    }));

    it('can drop collected changes when they equate to no change', () => {
      undoManager.collectKey = 'k';
      undoManager.shouldPush = (state): boolean =>
        !isEqual(state, undoManager.state());

      setCounter(1);
      expectStack(0, 1);
      setCounter(0);
      expectStack(0);
    });
  });

  describe('.undo()', () => {
    it('undoes, giving the correct arguments to the subclass', () => {
      setCounter(1);
      setCounter(2);
      expect(undoManager.lastApplicationUndoOrRedo).toBeUndefined();
      expect(undoManager.lastApplicationStateToOverwrite).toBeUndefined();

      undoManager.undo();
      expect(store.state).toEqual(changedState(1));
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('undo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual(
        changedState(2),
      );

      undoManager.undo();
      expect(store.state).toEqual(new State());
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('undo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual(
        changedState(1),
      );
    });

    it('throws an error if at the beginning of the stack', () => {
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');

      setCounter(1);
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');

      undoManager.redo();
      setCounter(2);
      undoManager.undo();
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      setCounter(1);

      undoManager.undo();
      setCounter(2);

      expectStack(0, 2);
    });
  });

  describe('.redo()', () => {
    it('redoes, giving the correct arguments to the subclass', () => {
      setCounter(1);
      setCounter(2);
      undoManager.undo();
      undoManager.undo();

      undoManager.redo();
      expect(store.state).toEqual(changedState(1));
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('redo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual(new State());

      undoManager.redo();
      expect(store.state).toEqual(changedState(2));
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('redo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual(
        changedState(1),
      );
    });

    it('throws an error if at the end of the stack', () => {
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      setCounter(1);
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      undoManager.undo();
      undoManager.redo();
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      setCounter(2);
      undoManager.undo();
      undoManager.undo();
      undoManager.redo();
      undoManager.redo();
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');
    });
  });

  describe('.dropCurrentUndoState()', () => {
    it('drops the current undo state', () => {
      setCounter(1);
      setCounter(2);

      expectStack(0, 1, 2);
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
      undoManager.dropCurrentUndoState();
      expectStack(0);
    });

    it('drops redo history', () => {
      setCounter(1);
      setCounter(2);
      setCounter(3);
      setCounter(4);

      undoManager.undo();
      undoManager.undo();
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
    });

    it('does not affect the store', () => {
      setCounter(1);
      setCounter(2);

      undoManager.dropCurrentUndoState();
      expect(store.state.counter).toBe(2);

      undoManager.dropCurrentUndoState();
      expect(store.state.counter).toBe(2);
    });

    it('throws an error if at the beginning of the stack', () => {
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');

      setCounter(1);
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');

      setCounter(2);
      setCounter(3);
      undoManager.dropCurrentUndoState();
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      setCounter(1);

      undoManager.dropCurrentUndoState();
      setCounter(2);

      expectStack(0, 2);
    });
  });

  describe('.shouldPush()', () => {
    it('controls whether undo states are actually pushed', () => {
      undoManager.shouldPush = (): boolean => true;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = (): boolean => false;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = (): boolean => true;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);

      undoManager.shouldPush = (): boolean => false;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);
    });

    it('is not used if nothing is yet in the stack', () => {
      const spy = jasmine.createSpy().and.returnValue(true);
      undoManager.shouldPush = spy;
      setCounter(1);
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      undoManager.reset();
      expect(spy).not.toHaveBeenCalled();
    });

    it('prevents a non-change from clearing the redo history', () => {
      setCounter(1);
      undoManager.undo();

      undoManager.shouldPush = (): boolean => false;
      setCounter(2);
      expectStack(0, 1);

      undoManager.shouldPush = (): boolean => true;
      setCounter(3);
      expectStack(0, 3);
    });
  });

  describe('managing stack size', () => {
    it('respects `maxDepth` by default (when given)', () => {
      undoManager = new TestImpl(store, 2);
      setCounter(1);
      expectStack(0, 1);

      setCounter(2);
      expectStack(1, 2);

      setCounter(3);
      expectStack(2, 3);

      undoManager.undo();
      setCounter(4);
      expectStack(2, 4);

      setCounter(5);
      expectStack(4, 5);
    });

    it('respects `.isOverSize()` when overridden', () => {
      let numToDrop = 0;
      undoManager = new (class extends TestImpl {
        constructor() {
          super(store, 2);
        }

        protected override isOverSize(): boolean {
          if (numToDrop > 0) {
            --numToDrop;
            return true;
          } else {
            return false;
          }
        }
      })();

      setCounter(1);
      setCounter(2);
      setCounter(3);
      expectStack(0, 1, 2, 3);

      numToDrop = 2;
      setCounter(4);
      expectStack(2, 3, 4);

      numToDrop = 999;
      setCounter(5);
      expectStack(5);
    });
  });

  describe('documentation', () => {
    it('works', () => {
      interface MyAppState {
        counter: number;
      }

      @Injectable({ providedIn: 'root' })
      class MyAppStore extends RootStore<MyAppState> {
        constructor() {
          super({ counter: 0 });
        }
      }

      // vvvvv documentation below
      @Injectable({ providedIn: 'root' })
      class UndoService extends UndoManagerSuperclass<MyAppState, MyAppState> {
        constructor() {
          super(inject(MyAppStore));
        }

        protected extractUndoState(state: MyAppState): MyAppState {
          // In practice, you'll usually want to track only part of the state...
          return state;
        }

        protected applyUndoState(stateToApply: MyAppState): void {
          // ...and restore only those parts here.
          this.store.state = stateToApply;
        }
      }
      // ^^^^^ documentation above

      TestBed.runInInjectionContext(() => {
        const myStore = TestBed.inject(MyAppStore);
        const undoService = TestBed.inject(UndoService);

        // vvvvv documentation below
        ++myStore('counter').state;
        undoService.pushCurrentState();

        undoService.undo();
        expect(myStore.state.counter).toBe(0);
        undoService.redo();
        expect(myStore.state.counter).toBe(1);
        // ^^^^^ documentation above
      });
    });
  });

  function setCounter(value: number): void {
    TestBed.tick();
    store('counter').state = value;
    TestBed.tick();
  }

  function changedState(counter: number): State {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return { ...new State(), counter };
  }

  function expectStack(...states: number[]): void {
    expect(undoManager.snapshot().stack.map((s) => s.counter)).toEqual(states);
  }
});
