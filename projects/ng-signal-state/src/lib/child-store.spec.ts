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
        store<'optional', InnerState>('optional')('state').set(2);
      }).toThrowError('cannot modify when parent state is missing');
    });

    it('throws with a useful message even when the root key is missing', () => {
      store.delete();
      expect(() => {
        store<'optional', InnerState>('optional')('state').set(2);
      }).toThrowError('cannot modify when parent state is missing');
    });
  });

  describe('.set()', () => {
    it('stores the exact object given', () => {
      const before = store.state().nested;
      const set = new InnerState();
      store('nested').set(set);
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual(new InnerState());
    });

    it('works with undefined', () => {
      store('optional').set(new InnerState());
      expect(store.state().optional).not.toBeUndefined();
      store('optional').set(undefined);
      expect(store.state().optional).toBeUndefined();
    });
  });

  describe('.delete()', () => {
    it('removes sub-trees from the store', () => {
      store('optional').set(new InnerState());
      store<'optional', InnerState>('optional')('left').set(new InnerState());
      expect(store.state().optional!.left).toEqual(new InnerState());

      store<'optional', InnerState>('optional')('left').delete();
      expect(store.state().optional).not.toBe(undefined);
      expect(store.state().optional!.left).toBe(undefined);

      store('optional').delete();
      expect(store.state() as any).not.toBe(undefined);
      expect(store.state().optional).toBe(undefined);
    });
  });
});
