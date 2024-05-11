import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { RootStore } from '../root-store';
import { Store } from '../store';
import { pushToArrayStore } from './push-to-array-store';

describe('pushToArrayStore', () => {
  it('adds the specified item to the store', () => {
    const store = new RootStore<number[]>([]);
    pushToArrayStore(store, 1);
    expect(store.state).toEqual([1]);
    pushToArrayStore(store, 2);
    expect(store.state).toEqual([1, 2]);
    pushToArrayStore(store, 17);
    expect(store.state).toEqual([1, 2, 17]);
  });

  it('returns a store object representing the newly pushed item', () => {
    const store = new RootStore<number[]>([]);

    let added = pushToArrayStore(store, 1);
    added.state = 2;
    expect(store.state).toEqual([2]);

    added = pushToArrayStore(store, 17);
    added.state = -12;
    expect(store.state).toEqual([2, -12]);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const store: Store<number[]> = new RootStore<number[]>([]);
      expectTypeOf(pushToArrayStore(store, 5)).toEqualTypeOf<Store<number>>();
    });
  });
});
