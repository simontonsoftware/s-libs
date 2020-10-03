import { clone, every, forOwn } from 'micro-dash';
import { Observable, Subscriber } from 'rxjs';
import { CallableObject } from 's-js-utils';
import { ChildStore } from './index';

/** @hidden */
export interface Client {
  runInBatch(func: () => void): void;
}

/** @hidden */
type GetSlice<T> = <K extends keyof T>(attr: K) => Store<T[K]>;

export interface Store<T> extends GetSlice<T> {
  // tslint:disable:callable-types
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `StoreObject` that represents the `currentUser` property.
   */
  <K extends keyof T, V extends T[K]>(attr: K): Store<V>;
}

export abstract class Store<T> extends CallableObject<GetSlice<T>> {
  /**
   * An `Observable` of the state of this store object.
   */
  readonly $ = new Observable<T>((subscriber) => {
    const value = this.state();
    this.subscribers.set(subscriber, value);
    this.maybeActivate();
    subscriber.next(value);
    return () => {
      this.subscribers.delete(subscriber);
      this.maybeDeactivate();
    };
  });

  protected subscribers = new Map<Subscriber<T>, T | undefined>();
  protected activeChildren: Record<string, Set<Store<any>>> = {};
  protected lastKnownState?: T;

  private lastKnownStateChanged = false;

  constructor(private client: Client) {
    super(
      (childKey: any) =>
        this.activeChildren[childKey]?.values().next()?.value ||
        new ChildStore(client, this, childKey),
    );
  }

  /**
   * Retrieve the current state represented by this store object.
   */
  abstract state(): T;

  /**
   * Replace the state represented by this store object with the given value.
   */
  abstract set(value: T): void;

  /**
   * Removes the state represented by this store object from its parent. E.g. to remove the current user:
   *
   * ```ts
   * store('currentUser').delete();
   * ```
   */
  abstract delete(): void;

  /**
   * @returns whether the given `StoreObject` operates on the same slice of the store as this object.
   */
  abstract refersToSameStateAs(other: Store<T>): boolean;

  /**
   * Allows batching multiple mutations on this store object so that observers only receive one event. The batch maintains its own fork of the full global state until it completes, then commits it to the store. Calls to `.state()` on the batch will fetch from the forked state.
   *
   * ```ts
   * store.batch((batch) => {
   *   batch.assign({ key1: value1 });
   *   batch('key2').delete();
   *   batch('key3').set({ key4: value4 });
   *
   *   batch('key1').state(); // returns `value1`
   *   store('key1').state(); // don't do this. may not return `value1`
   * });
   * ```
   */
  batch(func: () => void): void {
    this.client.runInBatch(func);
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  assign(value: Partial<T>): void {
    this.setUsing((state: any) => {
      if (every(value, (innerValue, key) => state[key] === innerValue)) {
        return state;
      } else {
        return { ...state, ...(value as any) };
      }
    });
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  setUsing<A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ): void {
    this.set(func(this.state(), ...args));
  }

  /**
   * Runs `func` on a shallow clone of the state, replacing the state with the clone. The first argument to `func` will be the cloned state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate nested objects within the state.
   */
  mutateUsing<A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ): void {
    const state = clone(this.state());
    func(state, ...args);
    this.set(state);
  }

  protected abstract maybeActivate(): void;

  protected abstract maybeDeactivate(): void;

  protected updateState(value: any): void {
    if (value === this.lastKnownState) {
      return;
    }

    this.lastKnownState = value;
    this.lastKnownStateChanged = true;
    forOwn(this.activeChildren, (children, key) => {
      for (const child of children) {
        child.updateState(value?.[key]);
      }
    });
  }

  protected maybeEmit(): void {
    if (!this.lastKnownStateChanged) {
      return;
    }

    this.lastKnownStateChanged = false;
    this.subscribers.forEach((lastEmitted, subscriber) => {
      if (lastEmitted !== this.lastKnownState) {
        subscriber.next(this.lastKnownState);
        this.subscribers.set(subscriber, this.lastKnownState);
      }
    });
    forOwn(this.activeChildren, (children) => {
      for (const child of children) {
        child.maybeEmit();
      }
    });
  }

  protected isChildActive(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): boolean {
    return parent.activeChildren[key]?.has(child);
  }

  protected activateChild(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): void {
    let set = parent.activeChildren[key];
    if (!set) {
      set = parent.activeChildren[key] = new Set<ChildStore<any>>();
    }
    set.add(child);
    parent.maybeActivate();
  }

  protected deactivateChild(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): void {
    const set = parent.activeChildren[key];
    set.delete(child);
    if (set.size === 0) {
      delete parent.activeChildren[key];
      parent.maybeDeactivate();
    }
  }
}
