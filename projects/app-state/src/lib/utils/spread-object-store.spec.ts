import { RootStore } from '../root-store';
import { Store } from '../store';
import { spreadObjectStore$ } from './spread-object-store';

describe('spreadObjectStore$()', () => {
  let store: Store<Record<string, number>>;

  beforeEach(() => {
    const state: Record<string, number> = { a: 1, b: 2 };
    store = new RootStore(state);
  });

  it('emits a separate store object for each element in the object', () => {
    store.set({ a: 1, b: 2 });
    let emitted: Array<Store<number>>;
    spreadObjectStore$(store).subscribe((stores) => {
      emitted = stores;
    });
    expect(emitted!.length).toBe(2);
    expect(emitted![0].state()).toBe(1);
    expect(emitted![1].state()).toBe(2);

    store.set({ c: 3, d: 4, e: 5 });
    expect(emitted!.length).toBe(3);
    expect(emitted![0].state()).toBe(3);
    expect(emitted![1].state()).toBe(4);
    expect(emitted![2].state()).toBe(5);

    store.set({ f: 6 });
    expect(emitted!.length).toBe(1);
    expect(emitted![0].state()).toBe(6);

    store.set({});
    expect(emitted!.length).toBe(0);
  });

  it('only emits when the keys of the object change', () => {
    store.set({ a: 1, b: 2 });
    const spy = jasmine.createSpy();
    spreadObjectStore$(store).subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    store.set({ a: 3, b: 4 });
    expect(spy).toHaveBeenCalledTimes(1);

    store.set({ a: 5, b: 6, c: 7 });
    expect(spy).toHaveBeenCalledTimes(2);

    store.set({ a: 5, b: 6, d: 7 });
    expect(spy).toHaveBeenCalledTimes(3);

    store.set({ a: 5, b: 6 });
    expect(spy).toHaveBeenCalledTimes(4);

    store.set({ a: 1, b: 2 });
    expect(spy).toHaveBeenCalledTimes(4);
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('emits the same object reference for keys that remain', () => {
    store.set({ a: 1, b: 2 });
    let lastEmit: Array<Store<number>>;
    let previousEmit: Array<Store<number>>;
    spreadObjectStore$(store).subscribe((stores) => {
      previousEmit = lastEmit;
      lastEmit = stores;
    });

    store.set({ a: 3, b: 4, c: 5 });
    expect(lastEmit![0]).toBe(previousEmit![0]);
    expect(lastEmit![1]).toBe(previousEmit![1]);

    store.set({ b: 6 });
    expect(lastEmit![0]).toBe(previousEmit![1]);
  });
});
