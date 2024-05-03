import { signal, WritableSignal } from '@angular/core';
import { buildChild } from './child-store';
import { Store } from './store';

/** See documentation at {@linkcode Store}. */
export class RootStore<T> extends Store<T> {
  #signal: WritableSignal<T>;

  constructor(state: T) {
    const backingSignal = signal(state);
    super(backingSignal, buildChild);
    this.#signal = backingSignal;
  }

  protected override set(value: T): void {
    this.#signal.set(value);
  }
}
