import { RootStore } from '../root-store';
import { Store } from '../store';
import { spreadArrayStore$ } from './spread-array-store';

describe('spreadArrayStore$()', () => {
  let store: Store<number[]>;

  beforeEach(() => {
    store = new RootStore([1, 2]);
  });

  it('emits a separate store object for each element in the array', () => {
    store.set([1, 2]);
    let emitted: Array<Store<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      emitted = stores;
    });
    expect(emitted!.length).toBe(2);
    expect(emitted![0].state()).toBe(1);
    expect(emitted![1].state()).toBe(2);

    store.set([3, 4, 5]);
    expect(emitted!.length).toBe(3);
    expect(emitted![0].state()).toBe(3);
    expect(emitted![1].state()).toBe(4);
    expect(emitted![2].state()).toBe(5);

    store.set([6]);
    expect(emitted!.length).toBe(1);
    expect(emitted![0].state()).toBe(6);

    store.set([]);
    expect(emitted!.length).toBe(0);
  });

  it('only emits when the length of the array changes', () => {
    store.set([1, 2]);
    const spy = jasmine.createSpy();
    spreadArrayStore$(store).subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    store.set([3, 4]);
    expect(spy).toHaveBeenCalledTimes(1);

    store.set([5, 6, 7]);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('emits the same object reference for indexes that remain', () => {
    store.set([1, 2]);
    let lastEmit: Array<Store<number>>;
    let previousEmit: Array<Store<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      previousEmit = lastEmit;
      lastEmit = stores;
    });

    store.set([3, 4, 5]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
    expect(lastEmit![1]).toBe(previousEmit![1]);

    store.set([6]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
  });
});
