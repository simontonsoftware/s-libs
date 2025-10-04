import { computed, Signal } from '@angular/core';
import { clone } from '@s-libs/micro-dash';
import { AbstractStore } from './abstract-store';
import { Key } from './interfaces';
import { Store } from './store';

export class ChildStore<T> extends AbstractStore<T> {
  constructor(
    private parent: Store<any>,
    private key: Key,
    private signal: Signal<T>,
  ) {
    super(
      (childKey) =>
        new ChildStore(
          this,
          childKey,
          computed(() => this.state?.[childKey as keyof T]),
        ),
    );
  }

  /**
   * Get the current state of this store object. This is backed by a signal, so it will trigger change detection when accessed in templates, etc.
   */
  override get state(): T {
    return this.signal();
  }

  /**
   * Change the value of this store. Following the pattern of immutable objects, the parent store will also update with shallow copy but with this value swapped in, and so on for all ancestors.
   */
  override set state(value: T) {
    if (value === this.state) {
      return;
    }

    const parentState = clone(this.parent.state);
    if (parentState === undefined) {
      throw new Error('cannot modify when parent state is missing');
    }

    parentState[this.key] = value;
    this.parent.state = parentState;
  }
}
