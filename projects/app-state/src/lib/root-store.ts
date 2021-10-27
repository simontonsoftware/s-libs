import { Store } from './index';

export class RootStore<T extends object> extends Store<T> {
  private batchCount = 0;

  constructor(state: T) {
    super(() => this);
    this.set(state);
  }

  set(value: T): void {
    this.updateState(value);
    this.maybeEmit();
  }

  delete(): void {
    this.set(undefined as any);
  }

  state(): T {
    return this.lastKnownState!;
  }

  /**
   * Turns off this store's observables while `func` is executing, emitting only once afterward, if the store changed. This allows you to batch multiple mutations into a single update at the end.
   *
   * ```ts
   * store.batch(() => {
   *   store.assign({ key1: value1 });
   *   store('key2').delete();
   *   store('key3').set({ key4: value4 });
   *
   *   store('key1').state(); // returns `value1`
   * });
   * ```
   */
  batch(func: VoidFunction): void {
    ++this.batchCount;
    try {
      func();
    } finally {
      if (--this.batchCount === 0) {
        this.maybeEmit();
      }
    }
  }

  refersToSameStateAs(other: Store<T>): boolean {
    return this === other;
  }

  protected override maybeEmit(): void {
    if (this.batchCount === 0) {
      super.maybeEmit();
    }
  }

  protected maybeActivate(): void {
    // root stores are always active
  }

  protected maybeDeactivate(): void {
    // root stores are always active
  }
}
