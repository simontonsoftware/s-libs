import { noop } from '@s-libs/micro-dash';
import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './root-store';

describe('RootStore', () => {
  let store: RootStore<TestState>;

  beforeEach(() => {
    store = new RootStore(new TestState());
  });

  describe('constructor', () => {
    it('uses the given constructor arguments', () => {
      const state = { initial: true };
      expect(new RootStore(state).state()).toBe(state);
    });

    it('can have multiple instances', () => {
      const store1 = new RootStore({ firstValue: 1 });
      const store2 = new RootStore({ secondValue: 1 });
      expect(store1.state()).toEqual({ firstValue: 1 });
      expect(store2.state()).toEqual({ secondValue: 1 });

      store1('firstValue').set(2);
      store2('secondValue').set(3);
      expect(store1.state()).toEqual({ firstValue: 2 });
      expect(store2.state()).toEqual({ secondValue: 3 });
    });
  });

  describe('.set()', () => {
    it('works', () => {
      const before = store.state();
      const set = {
        counter: 2,
        nested: new InnerState(),
      };
      store.set(set);
      const after = store.state();

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual({
        counter: 2,
        nested: new InnerState(),
      });
    });
  });

  describe('.delete()', () => {
    it('sets the state to `undefined`', () => {
      store.delete();
      expect(store.state() as any).toEqual(undefined);
    });
  });

  describe('.state()', () => {
    it('works', () => {
      expect(store.state()).toEqual(new TestState());
      store('nested')('state').set(1);
      expect(store.state().nested.state).toBe(1);
    });
  });

  describe('.batch()', () => {
    it('causes a single update after multiple actions', () => {
      const next = jasmine.createSpy();

      store.$.subscribe(next);
      expect(next).toHaveBeenCalledTimes(1);

      store.batch(() => {
        store('counter').set(3);
        store('nested')('state').set(6);
        expect(next).toHaveBeenCalledTimes(1);
      });

      expect(next).toHaveBeenCalledTimes(2);
      expect(store.state()).toEqual({ counter: 3, nested: { state: 6 } });
    });

    it('works when nested', () => {
      store.batch(() => {
        store('counter').set(1);
        store.batch(() => {
          expect(store.state().counter).toBe(1);
          store('counter').set(2);
          expect(store.state().counter).toBe(2);
        });
        expect(store.state().counter).toBe(2);
      });
      expect(store.state().counter).toBe(2);
    });

    it("doesn't have that infinite loop with 2 stores (production bug)", () => {
      // https://github.com/simontonsoftware/ng-app-state/issues/28
      const store2 = new RootStore<Record<string, never>>({});
      store.$.subscribe(() => {
        store2.batch(noop);
      });
      store2.$.subscribe();
      store('counter').set(1);

      // the infinite loop was here

      expect(store.state().counter).toBe(1);
    });

    it("doesn't have that infinite loop with batches (production bug)", () => {
      // https://github.com/simontonsoftware/ng-app-state/issues/29
      class State {
        version = 1;
        looping = false;
      }
      const loopStore = new RootStore<State>(new State());
      loopStore('version').$.subscribe(() => {
        loopStore.batch(noop);
      });
      loopStore('looping').$.subscribe(() => {
        loopStore('version').set(2);
        loopStore('version').set(3);
      });

      loopStore('looping').set(true);
      // the infinite loop was here

      expect(loopStore.state().version).toBe(3);
    });

    it('starts nested batches with the correct state (production bug)', () => {
      store.batch(() => {
        store('counter').set(1);
        store.batch(() => {
          expect(store.state().counter).toBe(1);
          store('nested')('state').set(2);
        });
      });
      expect(store.state()).toEqual(
        jasmine.objectContaining({ counter: 1, nested: { state: 2 } }),
      );
    });
  });

  describe('.refersToSameStateAs()', () => {
    it('works', () => {
      expect(store.refersToSameStateAs(store)).toBe(true);
      expect(store.refersToSameStateAs(store<any>('counter'))).toBe(false);
      expect(store.refersToSameStateAs(new RootStore(new TestState()))).toBe(
        false,
      );
    });
  });
});
