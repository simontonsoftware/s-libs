import { clone, isEmpty, omit } from '@s-libs/micro-dash';
import { RootStore, Store } from './index';

/** @hidden */
export class ChildStore<T> extends Store<T> {
  constructor(
    getRootStore: () => RootStore<object>,
    private parent: Store<any>,
    private key: any,
  ) {
    super(getRootStore);
  }

  set(value: T): void {
    if (value === this.state()) {
      return;
    }

    const parentState = clone(this.parent.state());
    if (!parentState) {
      throw new Error('cannot modify when parent state is missing');
    }

    parentState[this.key] = value;
    this.parent.set(parentState);
  }

  delete(): void {
    this.parent.setUsing(omit, this.key);
  }

  state(): T {
    if (this.isActive()) {
      return this.lastKnownState!;
    } else {
      return this.parent.state()?.[this.key];
    }
  }

  refersToSameStateAs(other: Store<T>): boolean {
    return (
      other instanceof ChildStore &&
      this.key === other.key &&
      this.parent.refersToSameStateAs(other.parent)
    );
  }

  protected maybeActivate(): void {
    if (!this.isActive() && this.shouldBeActive()) {
      this.activateChild(this.parent, this.key, this);
      this.lastKnownState = this.parent.state()?.[this.key];
    }
  }

  protected maybeDeactivate(): void {
    if (this.isActive() && !this.shouldBeActive()) {
      this.deactivateChild(this.parent, this.key, this);
    }
  }

  private shouldBeActive(): boolean {
    return this.subscribers.size > 0 || !isEmpty(this.activeChildren);
  }

  private isActive(): boolean {
    return this.isChildActive(this.parent, this.key, this);
  }
}
