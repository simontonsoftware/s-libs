import { CallableObject } from '@s-libs/js-core';
import { clone, every, isUndefined } from '@s-libs/micro-dash';
import { Observable, Subscriber } from 'rxjs';
import { buildChild } from './child-store';
import { ChildStore, RootStore } from './index';

/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-unsafe-declaration-merging */

type GetSlice<T> = <K extends keyof T>(attr: K) => Store<T[K]>;

export interface Store<T> extends GetSlice<T> {
  /**
   * Select a slice of the store to operate on. For example `store('currentUser')` will return a new `Store` that represents the `currentUser` property.
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
    return (): void => {
      this.subscribers.delete(subscriber);
      this.maybeDeactivate();
    };
  });

  protected subscribers = new Map<Subscriber<T>, T | undefined>();
  protected activeChildren = new Map<string, Set<Store<unknown>>>();
  protected lastKnownState?: T;

  #lastKnownStateChanged = false;

  constructor(
    public getRootStore: () => RootStore<object>,
    makeChild: typeof buildChild,
  ) {
    super(
      (childKey: any): Store<any> =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.activeChildren.get(childKey)?.values().next()?.value ??
        makeChild(getRootStore, this, childKey),
    );
  }

  /**
   * Assigns the given values to state of this store object. The resulting state will be like `Object.assign(store.state(), value)`.
   */
  assign(value: Partial<T>): void {
    this.setUsing((state: any) => {
      if (isUndefined(state)) {
        throw new Error('cannot assign to undefined state');
      }

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

  protected updateState(value: any): void {
    if (value === this.lastKnownState) {
      return;
    }

    this.lastKnownState = value;
    this.#lastKnownStateChanged = true;
    this.activeChildren.forEach((children, key) => {
      for (const child of children) {
        child.updateState(value?.[key]);
      }
    });
  }

  protected maybeEmit(): void {
    if (!this.#lastKnownStateChanged) {
      return;
    }

    this.#lastKnownStateChanged = false;
    this.subscribers.forEach((lastEmitted, subscriber) => {
      if (lastEmitted !== this.lastKnownState) {
        // Non-null assertion added in upgrade to 20. There may be times we emit `undefined` while deleting a key in a way that breaks type safety - but at that point we already broke type safety...
        subscriber.next(this.lastKnownState!);
        this.subscribers.set(subscriber, this.lastKnownState);
      }
    });
    this.activeChildren.forEach((children) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `children` can be undefined if emitting from a previous key removed all subscribers to this key
      for (const child of children ?? []) {
        child.maybeEmit();
      }
    });
  }

  protected isChildActive(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): boolean {
    return parent.activeChildren.get(key)?.has(child) ?? false;
  }

  protected activateChild(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): void {
    let set = parent.activeChildren.get(key);
    if (!set) {
      set = new Set<ChildStore<any>>();
      parent.activeChildren.set(key, set);
    }
    set.add(child);
    parent.maybeActivate();
  }

  protected deactivateChild(
    parent: Store<any>,
    key: any,
    child: ChildStore<any>,
  ): void {
    const set = parent.activeChildren.get(key)!;
    set.delete(child);
    if (set.size === 0) {
      parent.activeChildren.delete(key);
      parent.maybeDeactivate();
    }
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
   * @returns whether the given `Store` operates on the same slice of the store as this object.
   */
  abstract refersToSameStateAs(other: Store<T>): boolean;

  protected abstract maybeActivate(): void;

  protected abstract maybeDeactivate(): void;
}
