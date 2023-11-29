import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './index';

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
});
