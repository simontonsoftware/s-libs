import { RootStore } from '../root-store';
import { Store } from '../store';
import { pushToStoreArray } from './push-to-store-array';

describe('pushToStoreArray', () => {
  let store: Store<number[]>;

  beforeEach(() => {
    store = new RootStore([1, 2]);
  });

  it('adds the specified item to the store', () => {
    store.set([]);
    pushToStoreArray(store, 1);
    expect(store.state()).toEqual([1]);
    pushToStoreArray(store, 2);
    expect(store.state()).toEqual([1, 2]);
    pushToStoreArray(store, 17);
    expect(store.state()).toEqual([1, 2, 17]);
  });

  it('returns a store object representing the newly pushed item', () => {
    store.set([]);

    let added = pushToStoreArray(store, 1);
    added.set(2);
    expect(store.state()).toEqual([2]);

    added = pushToStoreArray(store, 17);
    added.set(-12);
    expect(store.state()).toEqual([2, -12]);
  });

  it('works within a batch (production bug)', () => {
    store.set([]);
    let so1: Store<number>;
    let so2: Store<number>;

    store.batch(() => {
      so1 = pushToStoreArray(store, 1);
      so2 = pushToStoreArray(store, 2);

      expect(so1.state()).toEqual(1);
      expect(so2.state()).toEqual(2);
    });
    expect(store.state()).toEqual([1, 2]);
    expect(so1!.state()).toEqual(1);
    expect(so2!.state()).toEqual(2);
  });
});
