import { computed, Signal } from '@angular/core';
import { clone } from '@s-libs/micro-dash';
import { AbstractStore } from './abstract-store';
import { Store } from './store';

// defined here and passed to `Store` to work around some problems with circular imports
export function buildChild(parent: Store<any>, childKey: any): ChildStore<any> {
  const childSignal = computed((): any => parent.state?.[childKey]);
  return new ChildStore(parent, childKey, childSignal);
}

export class ChildStore<T> extends AbstractStore<T> {
  constructor(
    private parent: Store<any>,
    private key: any,
    signal: Signal<T>,
  ) {
    super(signal, buildChild);
  }

  protected override set(value: T): void {
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
