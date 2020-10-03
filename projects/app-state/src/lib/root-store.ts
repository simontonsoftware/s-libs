import { Store } from './index';

export class RootStore<T extends object> extends Store<T> {
  private batchCount = 0;

  constructor(state: T) {
    super({
      runInBatch: (func: () => void) => {
        ++this.batchCount;
        try {
          func();
        } finally {
          if (--this.batchCount === 0) {
            this.maybeEmit();
          }
        }
      },
    });
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

  refersToSameStateAs(other: Store<T>): boolean {
    return this === other;
  }

  protected maybeEmit(): void {
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
