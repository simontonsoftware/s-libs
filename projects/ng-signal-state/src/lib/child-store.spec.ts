import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './index';

describe('ChildStore', () => {
  let store: RootStore<TestState>;

  beforeEach(() => {
    store = new RootStore(new TestState());
  });

  describe('()', () => {
    it('throws with a useful message when used to modify missing state', () => {
      expect(() => {
        store<'optional', InnerState>('optional')('state').state = 2;
      }).toThrowError('cannot modify when parent state is missing');
    });

    it('throws with a useful message even when the root key is missing', () => {
      store.delete();
      expect(() => {
        store<'optional', InnerState>('optional')('state').state = 2;
      }).toThrowError('cannot modify when parent state is missing');
    });
  });

  describe('.delete()', () => {
    it('removes sub-trees from the store', () => {
      store('optional').state = new InnerState();
      store<'optional', InnerState>('optional')('left').state =
        new InnerState();
      expect(store('optional').state!.left).toEqual(new InnerState());

      store<'optional', InnerState>('optional')('left').delete();
      expect(store('optional').state).not.toBe(undefined);
      expect(store('optional').state!.left).toBe(undefined);

      store('optional').delete();
      expect(store.state as any).not.toBe(undefined);
      expect(store('optional').state).toBe(undefined);
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
