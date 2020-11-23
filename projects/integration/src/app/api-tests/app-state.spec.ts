import { fakeAsync, tick } from '@angular/core/testing';
import * as appState from '@s-libs/app-state';
import {
  pushToStoreArray,
  RootStore,
  spreadArrayStore$,
  spreadObjectStore$,
  Store,
  UndoManager,
} from '@s-libs/app-state';
import { keys } from '@s-libs/micro-dash';

describe('app-state', () => {
  describe('public API', () => {
    it('has RootStore', () => {
      expect(RootStore).toBeDefined();
    });

    it('has Store', () => {
      expect(Store).toBeDefined();
    });

    it('has UndoManager', () => {
      expect(UndoManager).toBeDefined();
    });

    it('has pushToStoreArray', () => {
      expect(pushToStoreArray).toBeDefined();
    });

    it('has spreadArrayStore$', () => {
      expect(spreadArrayStore$).toBeDefined();
    });

    it('has spreadObjectStore$', () => {
      expect(spreadObjectStore$).toBeDefined();
    });
  });

  describe('as a UMD bundle', () => {
    const bundle: typeof appState = (window as any).sLibs.appState;

    it('is available at sLibs.appState', () => {
      expect(keys(bundle)).toEqual(
        jasmine.arrayWithExactContents(keys(appState)),
      );
    });

    it('knows where to find micro-dash', () => {
      // Store.mutateUsing() uses micro-dash. This is one of its tests

      class InnerState {
        left?: InnerState;
        right?: InnerState;

        constructor(public state = 0) {}
      }
      class TestState {
        counter = 0;
        nested = new InnerState();
        optional?: InnerState;
        array?: number[];
      }
      const store = new bundle.RootStore(new TestState());

      store('array').set([]);

      store('array').mutateUsing((array) => {
        array!.push(1);
      });
      expect(store.state().array).toEqual([1]);

      store('array').mutateUsing(
        (array, a, b) => {
          array!.push(a, b);
        },
        2,
        3,
      );
      expect(store.state().array).toEqual([1, 2, 3]);
    });

    it('knows where to find js-core', fakeAsync(() => {
      // UndoManager.pushCurrentState() uses js-core for the `collectDebounce` feature. This is one of its tests

      class State {
        counter = 0;
        object?: any;
      }

      class TestImpl extends bundle.UndoManager<State, State> {
        lastApplicationUndoOrRedo?: 'undo' | 'redo';
        lastApplicationStateToOverwrite?: State;
        collectKey?: string;
        collectDebounce?: number;
        private skipNextChange = true;

        constructor(rootStore: RootStore<State>, maxDepth?: number) {
          super(rootStore, maxDepth);
          rootStore.$.subscribe(() => {
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
          undoOrRedo: 'undo' | 'redo',
          stateToOverwrite: State,
        ): void {
          this.skipNextChange = true;
          this.store.set(stateToApply);
          this.lastApplicationUndoOrRedo = undoOrRedo;
          this.lastApplicationStateToOverwrite = stateToOverwrite;
        }
      }

      const store = new RootStore(new State());
      const undoManager = new TestImpl(store);

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

      function expectStack(...states: number[]): void {
        expect(undoManager.undoStack.map((s) => s.counter)).toEqual(states);
      }
    }));

    it('knows where to find rxjs-core', () => {
      // spreadObjectStore$() uses rxjs-core. This is one of its tests.

      const state: Record<string, number> = { a: 1, b: 2 };
      const store = new RootStore(state);

      store.set({ a: 1, b: 2 });
      let lastEmit: Array<Store<number>>;
      let previousEmit: Array<Store<number>>;
      bundle.spreadObjectStore$(store).subscribe((stores) => {
        previousEmit = lastEmit;
        lastEmit = stores;
      });

      store.set({ a: 3, b: 4, c: 5 });
      expect(lastEmit![0]).toBe(previousEmit![0]);
      expect(lastEmit![1]).toBe(previousEmit![1]);

      store.set({ b: 6 });
      expect(lastEmit![0]).toBe(previousEmit![1]);
    });
  });
});
