import { InnerState, TestState } from '../test-helpers/test-state';
import { DetachedStore } from './detached-store';

describe('DetachedStore', () => {
  let store: DetachedStore<TestState>;

  beforeEach(() => {
    store = new DetachedStore(new TestState());
  });

  it('constructs with the given state', () => {
    const state = { foo: 1 };
    const s = new DetachedStore(state);
    expect(s.state).toBe(state);
  });

  describe('.state', () => {
    it('gets and sets root state', () => {
      const before = store.state;
      const set = { counter: 2, nested: new InnerState() };
      store.state = set;
      const after = store.state;
      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual({ counter: 2, nested: new InnerState() });
    });

    it('gets and sets child state', () => {
      const child = store('nested');
      const before = child.state;
      const set = new InnerState();
      child.state = set;
      const after = child.state;
      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual(new InnerState());
    });

    it('does not mutate previous state objects', () => {
      const startingState = store.state;
      const startingNested = startingState.nested;
      store('nested')('left').state = new InnerState();

      // operation worked
      expect(store.state.nested.left).not.toBeUndefined();

      // and did not modify starting state
      expect(startingState.nested).toBe(startingNested);
      expect(startingNested.left).toBeUndefined();
    });

    it('throws with a meaningful message when parent state is missing', () => {
      const child = store('optional');
      expect(() => {
        child('state').nonNull.state = 2;
      }).toThrowError('cannot modify when parent state is missing');
    });
  });
});
