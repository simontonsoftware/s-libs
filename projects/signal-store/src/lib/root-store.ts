import { signal, WritableSignal } from '@angular/core';
import { AbstractStore } from './abstract-store';
import { buildChild } from './child-store';

/** See documentation at {@linkcode Store}. */
export class RootStore<T> extends AbstractStore<T> {
  readonly #signal: WritableSignal<T>;

  constructor(state: T) {
    const backingSignal = signal(state);
    super(backingSignal, buildChild);
    this.#signal = backingSignal;
  }

  protected override set(value: T): void {
    this.#signal.set(value);
  }
}
