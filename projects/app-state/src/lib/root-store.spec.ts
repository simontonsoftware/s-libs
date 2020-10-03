import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './root-store';

describe('AppStore', () => {
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
