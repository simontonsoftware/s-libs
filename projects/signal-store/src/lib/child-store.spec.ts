import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './root-store';

describe('ChildStore', () => {
  let store: RootStore<TestState>;

  beforeEach(() => {
    store = new RootStore(new TestState());
  });

  describe('()', () => {
    it('throws with a useful message when used to modify missing state', () => {
      expect(() => {
        store('optional').nonNull('state').state = 2;
      }).toThrowError('cannot modify when parent state is missing');
    });
  });

  describe('.set()', () => {
    it('stores the exact object given', () => {
      const before = store('nested').state;
      const set = new InnerState();
      store('nested').state = set;
      const after = store('nested').state;

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual(new InnerState());
    });

    it('works with undefined', () => {
      store('optional').state = new InnerState();
      expect(store('optional').state).not.toBeUndefined();
      store('optional').state = undefined;
      expect(store('optional').state).toBeUndefined();
    });
  });
});
