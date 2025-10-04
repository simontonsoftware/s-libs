import { computed, signal, WritableSignal } from '@angular/core';
import { AbstractStore } from './abstract-store';
import { ChildStore } from './child-store';

/** See documentation at {@linkcode Store}. */
export class RootStore<T> extends AbstractStore<T> {
  readonly #signal: WritableSignal<T>;

  constructor(state: T) {
    super(
      (childKey) =>
        new ChildStore(
          this,
          childKey,
          computed(() => this.state?.[childKey as keyof T]),
        ),
    );
    this.#signal = signal(state);
  }

  /**
   * Get the current state of this store object. This is backed by a signal, so it will trigger change detection when accessed in templates, etc.
   */
  override get state(): T {
    return this.#signal();
  }

  /**
   * Change the value of this store.
   */
  override set state(value: T) {
    this.#signal.set(value);
  }
}
