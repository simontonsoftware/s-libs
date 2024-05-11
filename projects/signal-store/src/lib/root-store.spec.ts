import { staticTest } from '@s-libs/ng-dev';
import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore } from './root-store';

describe('RootStore', () => {
  describe('constructor', () => {
    it('uses the given constructor arguments', () => {
      const state = { initial: true };
      expect(new RootStore(state).state).toBe(state);
    });
  });

  describe('.set()', () => {
    it('works', () => {
      const store = new RootStore(new TestState());
      const before = store.state;
      const set = {
        counter: 2,
        nested: new InnerState(),
      };
      store.state = set;
      const after = store.state;

      expect(before).not.toBe(after);
      expect(after).toBe(set);
      expect(after).toEqual({
        counter: 2,
        nested: new InnerState(),
      });
    });
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const store = new RootStore<string | undefined>('hi');
      store.state = undefined;
      // @ts-expect-error -- can't assign when could be undefined
      store.assign({});
    });
  });
});
