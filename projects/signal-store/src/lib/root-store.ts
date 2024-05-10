import { signal, WritableSignal } from '@angular/core';
import { buildChild } from './child-store';
import { AbstractStore } from './abstract-store';

/** See documentation at {@linkcode Store}. */
// TODO: restrict nil types
export class RootStore<T> extends AbstractStore<T> {
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
