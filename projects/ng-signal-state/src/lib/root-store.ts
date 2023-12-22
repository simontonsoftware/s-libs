import { signal, WritableSignal } from '@angular/core';
import { buildChild } from './child-store';
import { Store } from './store';

export class RootStore<T extends object> extends Store<T> {
  #signal: WritableSignal<T>;

  constructor(state: T) {
    const backingSignal = signal(state);
    super(backingSignal, buildChild);
    this.#signal = backingSignal;
  }

  override delete(): void {
    this.set(undefined as any);
  }

  protected override set(value: T): void {
    this.#signal.set(value);
  }
}
