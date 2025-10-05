import { clone, get, last } from '@s-libs/micro-dash';
import { AbstractStore } from './abstract-store';
import { Key } from './interfaces';
import { Store } from './store';

/**
 * A store object that is NOT backed by signals. This is a utility class to efficiently manage deeply nested immutable state with the same API as {@linkcode RootStore}. This is useful when reusing functions that can work with stores used in your templates, but when you only need the result without directly rendering it, e.g. in unit tests.
 */
export class DetachedStore<T> extends AbstractStore<T> {
  constructor(public state: T) {
    super((childKey: Key) => new DetachedChild(this, this, [childKey]));
  }
}

class DetachedChild<T> extends AbstractStore<T> {
  constructor(
    private root: DetachedStore<any>,
    private parent: Store<any>,
    private path: Key[],
  ) {
    super(
      (childKey: Key) => new DetachedChild(root, this, [...path, childKey]),
    );
  }

  get state(): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- T is unknown
    return get(this.root.state, this.path);
  }

  set state(value: T) {
    if (value === this.state) {
      return;
    }

    const parentState = clone(this.parent.state);
    if (parentState === undefined) {
      throw new Error('cannot modify when parent state is missing');
    }

    parentState[last(this.path)] = value;
    this.parent.state = parentState;
  }
}
