import { signal, WritableSignal } from '@angular/core';
import { buildChild } from './child-store';
import { Store } from './index';

export class RootStore<T extends object> extends Store<T> {
  #signal: WritableSignal<T>;

  constructor(state: T) {
    const backingSignal = signal(state);
    super(backingSignal, buildChild);
    this.#signal = backingSignal;
  }

  set(value: T): void {
    this.#signal.set(value);
  }

  delete(): void {
    this.set(undefined as any);
  }
}
