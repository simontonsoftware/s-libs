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

  describe('.state()', () => {
    it('works when there are no subscribers', () => {
      expect(store('nested').state().state).toBe(0);
      expect(store('nested')('state').state()).toBe(0);

      store('nested')('state').set(1);
      expect(store('nested').state().state).toBe(1);
      expect(store('nested')('state').state()).toBe(1);
    });

    it('gets the in-progress value of a batch', () => {
      store.batch(() => {
        store('counter').set(1);
        expect(store.state().counter).toBe(1);

        store('counter').set(2);
        expect(store.state().counter).toBe(2);
      });
    });

    it('gets the new subvalue even when it has a later subscriber (production bug)', () => {
      let expectedValue: InnerState | undefined;
      store.$.subscribe(() => {
        expect(store('optional').state()).toBe(expectedValue);
      });
      store('optional').$.subscribe();

      expectedValue = new InnerState();
      store('optional').set(expectedValue);
    });

    it('works on a second store that subscribed later (production bug)', () => {
      const store2 = new RootStore(new TestState());
      let store2value = -1;
      store.$.subscribe(() => {
        store2value = store2.state().counter;
      });
      store2.$.subscribe();

      store.batch(() => {
        store('counter').set(3);
        store2('counter').set(3);
      });

      expect(store2value).toBe(3);
    });
  });

  describe('.refersToSameStateAs()', () => {
    it('works', () => {
      expect(
        store('counter').refersToSameStateAs(store('nested')('state')),
      ).toBe(false);
      expect(
        store('nested')('left').refersToSameStateAs(store('nested')('left')),
      ).toBe(true);
      expect(
        store('nested')('left').refersToSameStateAs(store('nested')('right')),
      ).toBe(false);
      expect(store.refersToSameStateAs(new RootStore(new TestState()))).toBe(
        false,
      );
      expect(
        store('counter').refersToSameStateAs(
          new RootStore(new TestState())('counter'),
        ),
      ).toBe(false);
    });
  });
});
