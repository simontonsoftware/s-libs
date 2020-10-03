import { fakeAsync, tick } from '@angular/core/testing';
import { isEqual } from 'micro-dash';
import { expectSingleCallAndReset } from 's-ng-dev-utils';
import { RootStore } from '../root-store';
import { UndoManager, UndoOrRedo } from './undo-manager';

class State {
  counter = 0;
  object?: any;
}

class TestImpl extends UndoManager<State, State> {
  lastApplicationUndoOrRedo?: UndoOrRedo;
  lastApplicationStateToOverwrite?: State;
  collectKey?: string;
  collectDebounce?: number;
  private skipNextChange = true;

  constructor(store: RootStore<State>, maxDepth?: number) {
    super(store, maxDepth);
    store.$.subscribe(() => {
      if (this.skipNextChange) {
        this.skipNextChange = false;
      } else {
        this.pushCurrentState({
          collectKey: this.collectKey,
          collectDebounce: this.collectDebounce,
        });
      }
    });
  }

  shouldPush(state: State): boolean {
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
    this.skipNextChange = true;
    this.store.set(stateToApply);
    this.lastApplicationUndoOrRedo = undoOrRedo;
    this.lastApplicationStateToOverwrite = stateToOverwrite;
  }
}

describe('UndoManager', () => {
  let store: RootStore<State>;
  let undoManager: TestImpl;

  beforeEach(() => {
    store = new RootStore(new State());
    undoManager = new TestImpl(store);
  });

  describe('.canUndo()', () => {
    it('is false (only) when at the beginning of the stack', () => {
      expect(undoManager.canUndo()).toBe(false);

      store('counter').set(1);
      expect(undoManager.canUndo()).toBe(true);

      undoManager.undo();
      expect(undoManager.canUndo()).toBe(false);

      undoManager.redo();
      expect(undoManager.canUndo()).toBe(true);

      store('counter').set(2);
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

      store('counter').set(1);
      expect(undoManager.canRedo()).toBe(false);

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      undoManager.redo();
      expect(undoManager.canRedo()).toBe(false);

      store('counter').set(2);
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

  describe('.canUndo$', () => {
    it('fires (only) when undoability changes', () => {
      const next = jasmine.createSpy();

      undoManager.canUndo$.subscribe(next);
      expectSingleCallAndReset(next, false);

      store('counter').set(1);
      expectSingleCallAndReset(next, true);

      undoManager.undo();
      expectSingleCallAndReset(next, false);

      undoManager.redo();
      expectSingleCallAndReset(next, true);

      store('counter').set(2);
      undoManager.undo();
      expect(next).not.toHaveBeenCalled();

      undoManager.undo();
      expectSingleCallAndReset(next, false);

      undoManager.redo();
      expectSingleCallAndReset(next, true);

      undoManager.reset();
      expectSingleCallAndReset(next, false);
    });

    it('fires immediately with the current value', () => {
      store('counter').set(1);
      const next = jasmine.createSpy();

      undoManager.canUndo$.subscribe(next);
      expectSingleCallAndReset(next, true);

      undoManager.undo();
      expectSingleCallAndReset(next, false);
    });
  });

  describe('.canRedo$', () => {
    it('fires (only) when redoability changes', () => {
      const next = jasmine.createSpy();

      undoManager.canRedo$.subscribe(next);
      expectSingleCallAndReset(next, false);

      store('counter').set(1);
      expect(next).not.toHaveBeenCalled();

      undoManager.undo();
      expectSingleCallAndReset(next, true);

      undoManager.redo();
      expectSingleCallAndReset(next, false);

      store('counter').set(2);
      expect(next).not.toHaveBeenCalled();

      undoManager.undo();
      expectSingleCallAndReset(next, true);

      undoManager.undo();
      undoManager.redo();
      expect(next).not.toHaveBeenCalled();

      undoManager.redo();
      expectSingleCallAndReset(next, false);

      undoManager.reset();
      expect(next).not.toHaveBeenCalled();
    });

    it('fires immediately with the current value', () => {
      store('counter').set(1);
      const next = jasmine.createSpy();

      undoManager.canRedo$.subscribe(next);
      expectSingleCallAndReset(next, false);

      undoManager.undo();
      expectSingleCallAndReset(next, true);
    });
  });

  describe('.state$', () => {
    it('fires (only) when the state changes', () => {
      const next = jasmine.createSpy();

      undoManager.state$.subscribe(next);
      expectSingleCallAndReset(next, new State());

      store('counter').set(1);
      expectSingleCallAndReset(next, { counter: 1 });

      undoManager.undo();
      expectSingleCallAndReset(next, new State());

      undoManager.redo();
      expectSingleCallAndReset(next, { counter: 1 });

      store('counter').set(10);
      expectSingleCallAndReset(next, { counter: 10 });

      undoManager.reset();
      expect(next).not.toHaveBeenCalled();
    });

    it('fires immediately with the current value', () => {
      store('counter').set(1);
      const next = jasmine.createSpy();

      undoManager.state$.subscribe(next);
      expectSingleCallAndReset(next, { counter: 1 });

      undoManager.undo();
      expectSingleCallAndReset(next, new State());
    });
  });

  describe('.reset()', () => {
    // most of `.reset()` is tested within the `.can[Un/Re]do()` blocks above

    it('does not affect the store', () => {
      undoManager.reset();
      expect(store.state().counter).toBe(0);

      store('counter').set(1);
      undoManager.reset();
      expect(store.state().counter).toBe(1);

      undoManager.reset();
      expect(store.state().counter).toBe(1);
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      store('counter').set(1);

      undoManager.reset();
      store('counter').set(2);

      expectStack(1, 2);
    });
  });

  describe('.pushCurrentState()', () => {
    it('adds to the stack', () => {
      undoManager.pushCurrentState();
      expectStack(0, 0);

      store('counter').set(1);
      expectStack(0, 0, 1);
      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1);

      undoManager.pushCurrentState();
      expectStack(0, 0, 1, 1, 1);
    });

    it('clears the stack after the current index', () => {
      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
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
      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);

      undoManager.collectKey = 'k2';
      store('counter').set(4);
      store('counter').set(5);

      expectStack(0, 3, 5);
    });

    it('resets collected changes with no key', () => {
      undoManager.collectKey = 'k1';
      store('counter').set(1);
      store('counter').set(2);

      undoManager.collectKey = undefined;
      store('counter').set(3);
      store('counter').set(4);

      undoManager.collectKey = 'k1';
      store('counter').set(5);
      store('counter').set(6);

      expectStack(0, 2, 3, 4, 6);
    });

    it('can reset collected changes after a timeout', fakeAsync(() => {
      undoManager.collectKey = 'k';
      undoManager.collectDebounce = 1000;

      store('counter').set(1);
      tick(999);
      store('counter').set(2);
      tick(1000);
      store('counter').set(3);
      tick(999);
      store('counter').set(4);
      tick(1000);
      store('counter').set(5);

      expectStack(0, 2, 4, 5);

      tick(1000);
    }));

    it('can drop collected changes when they equate to no change', () => {
      undoManager.collectKey = 'k';
      undoManager.shouldPush = (state) =>
        !isEqual(state, undoManager.currentUndoState);

      store('counter').set(1);
      expectStack(0, 1);
      store('counter').set(0);
      expectStack(0);
    });
  });

  describe('.undo()', () => {
    it('undoes, giving the correct arguments to the subclass', () => {
      store('counter').set(1);
      store('counter').set(2);
      expect(undoManager.lastApplicationUndoOrRedo).toBeUndefined();
      expect(undoManager.lastApplicationStateToOverwrite).toBeUndefined();

      undoManager.undo();
      expect(store.state()).toEqual({ counter: 1 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('undo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual({
        counter: 2,
      });

      undoManager.undo();
      expect(store.state()).toEqual(new State());
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('undo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual({
        counter: 1,
      });
    });

    it('throws an error if at the beginning of the stack', () => {
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');

      store('counter').set(1);
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');

      undoManager.redo();
      store('counter').set(2);
      undoManager.undo();
      undoManager.undo();
      expect(() => {
        undoManager.undo();
      }).toThrowError('Cannot undo');
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      store('counter').set(1);

      undoManager.undo();
      store('counter').set(2);

      expectStack(0, 2);
    });
  });

  describe('.redo()', () => {
    it('redoes, giving the correct arguments to the subclass', () => {
      store('counter').set(1);
      store('counter').set(2);
      undoManager.undo();
      undoManager.undo();

      undoManager.redo();
      expect(store.state()).toEqual({ counter: 1 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('redo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual(new State());

      undoManager.redo();
      expect(store.state()).toEqual({ counter: 2 });
      expect(undoManager.lastApplicationUndoOrRedo).toEqual('redo');
      expect(undoManager.lastApplicationStateToOverwrite).toEqual({
        counter: 1,
      });
    });

    it('throws an error if at the end of the stack', () => {
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      store('counter').set(1);
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      undoManager.undo();
      undoManager.redo();
      expect(() => {
        undoManager.redo();
      }).toThrowError('Cannot redo');

      store('counter').set(2);
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
      store('counter').set(1);
      store('counter').set(2);

      expectStack(0, 1, 2);
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
      undoManager.dropCurrentUndoState();
      expectStack(0);
    });

    it('drops redo history', () => {
      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
      store('counter').set(4);

      undoManager.undo();
      undoManager.undo();
      undoManager.dropCurrentUndoState();
      expectStack(0, 1);
    });

    it('does not affect the store', () => {
      store('counter').set(1);
      store('counter').set(2);

      undoManager.dropCurrentUndoState();
      expect(store.state().counter).toBe(2);

      undoManager.dropCurrentUndoState();
      expect(store.state().counter).toBe(2);
    });

    it('throws an error if at the beginning of the stack', () => {
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');

      store('counter').set(1);
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');

      store('counter').set(2);
      store('counter').set(3);
      undoManager.dropCurrentUndoState();
      undoManager.dropCurrentUndoState();
      expect(() => {
        undoManager.dropCurrentUndoState();
      }).toThrowError('Nothing to drop');
    });

    it('emits changes on canDo$', () => {
      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
      store('counter').set(4);
      const undoStub = jasmine.createSpy('canUndo');
      const redoStub = jasmine.createSpy('canRedo');
      undoManager.canUndo$.subscribe(undoStub);
      undoManager.canRedo$.subscribe(redoStub);
      expect(undoStub).toHaveBeenCalledTimes(1);
      expect(redoStub).toHaveBeenCalledTimes(1);

      undoManager.dropCurrentUndoState();
      expect(undoStub).toHaveBeenCalledTimes(1);
      expect(redoStub).toHaveBeenCalledTimes(1);

      undoManager.undo();
      expect(undoStub).toHaveBeenCalledTimes(1);
      expect(redoStub).toHaveBeenCalledTimes(2);

      undoManager.dropCurrentUndoState();
      expect(undoStub).toHaveBeenCalledTimes(1);
      expect(redoStub).toHaveBeenCalledTimes(3);

      undoManager.dropCurrentUndoState();
      expect(undoStub).toHaveBeenCalledTimes(2);
      expect(redoStub).toHaveBeenCalledTimes(3);
    });

    it('resets collected changes', () => {
      undoManager.collectKey = 'k1';
      store('counter').set(1);

      undoManager.dropCurrentUndoState();
      store('counter').set(2);

      expectStack(0, 2);
    });
  });

  describe('.currentUndoState', () => {
    it('works', () => {
      expect(undoManager.currentUndoState.counter).toBe(0);

      store('counter').set(1);
      expect(undoManager.currentUndoState.counter).toBe(1);

      store('counter').set(2);
      expect(undoManager.currentUndoState.counter).toBe(2);

      undoManager.undo();
      expect(undoManager.currentUndoState.counter).toBe(1);

      undoManager.undo();
      expect(undoManager.currentUndoState.counter).toBe(0);

      undoManager.redo();
      expect(undoManager.currentUndoState.counter).toBe(1);

      undoManager.redo();
      expect(undoManager.currentUndoState.counter).toBe(2);
    });
  });

  describe('.undoStack', () => {
    it('does not allow callers to mutate the internal stack', () => {
      store('counter').set(1);
      undoManager.undoStack.splice(0, 9999);
      expectStack(0, 1);
    });
  });

  describe('.shouldPush()', () => {
    it('controls whether undo states are actually pushed', () => {
      undoManager.shouldPush = () => true;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = () => false;
      undoManager.pushCurrentState();
      expectStack(0, 0);

      undoManager.shouldPush = () => true;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);

      undoManager.shouldPush = () => false;
      undoManager.pushCurrentState();
      expectStack(0, 0, 0);
    });

    it('is not used if nothing is yet in the stack', () => {
      const spy = jasmine.createSpy().and.returnValue(true);
      undoManager.shouldPush = spy;
      store('counter').set(1);
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      undoManager.reset();
      expect(spy).not.toHaveBeenCalled();
    });

    it('prevents a non-change from clearing the redo history', () => {
      store('counter').set(1);
      undoManager.undo();

      undoManager.shouldPush = () => false;
      store('counter').set(2);
      expectStack(0, 1);

      undoManager.shouldPush = () => true;
      store('counter').set(3);
      expectStack(0, 3);
    });
  });

  describe('managing stack size', () => {
    it('respects `maxDepth` by default (when given)', () => {
      undoManager = new TestImpl(store, 2);
      store('counter').set(1);
      expectStack(0, 1);

      store('counter').set(2);
      expectStack(1, 2);

      store('counter').set(3);
      expectStack(2, 3);

      undoManager.undo();
      store('counter').set(4);
      expectStack(2, 4);

      store('counter').set(5);
      expectStack(4, 5);
    });

    it('respects `.isOverSize()` when overridden', () => {
      let numToDrop = 0;
      undoManager = new (class extends TestImpl {
        constructor() {
          super(store, 2);
        }

        protected isOverSize(): boolean {
          if (numToDrop > 0) {
            --numToDrop;
            return true;
          } else {
            return false;
          }
        }
      })();

      store('counter').set(1);
      store('counter').set(2);
      store('counter').set(3);
      expectStack(0, 1, 2, 3);

      numToDrop = 2;
      store('counter').set(4);
      expectStack(2, 3, 4);

      numToDrop = 999;
      store('counter').set(5);
      expectStack(5);
    });
  });

  function expectStack(...states: number[]): void {
    expect(undoManager.undoStack.map((s) => s.counter)).toEqual(states);
  }
});
