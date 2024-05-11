import { Signal } from '@angular/core';
import { CallableObject, WeakValueMap } from '@s-libs/js-core';
import { clone, every, isUndefined } from '@s-libs/micro-dash';
import { buildChild, ChildStore } from './child-store';
import { GetSlice, Slice, Store } from './store';

export interface AbstractStore<T> {
  <K extends keyof NonNullable<T>>(attr: K): Slice<T, K>;
}

export abstract class AbstractStore<T>
  extends CallableObject<GetSlice<T>>
  implements Store<T>
{
  /**
   * Assigns the given values to the state of this store object. The resulting state will be like `Object.assign(store.state, value)`.
   */
  assign = this.#assign as Store<T>['assign'];

  #children = new WeakValueMap<keyof NonNullable<T>, ChildStore<any>>();

  constructor(
    private signal: Signal<T>,
    makeChild: typeof buildChild,
  ) {
    super((childKey): any => {
      let child = this.#children.get(childKey);
      if (child === undefined) {
        child = makeChild(this, childKey);
        this.#children.set(childKey, child);
      }
      return child;
    });
  }

  get nonNull(): Store<NonNullable<T>> {
    return this as unknown as Store<NonNullable<T>>;
  }

  /**
   * Get the current state of this store object. This is backed by a signal, so it will trigger change detection when accessed in templates, etc.
   */
  get state(): T {
    return this.signal();
  }

  /**
   * Change the value of this store. Following the pattern of immutable objects, the parent store will also update with shallow copy but with this value swapped in, and so on for all ancestors.
   */
  set state(value: T) {
    this.set(value);
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  update<A extends any[]>(func: (state: T, ...args: A) => T, ...args: A): void {
    this.set(func(this.state, ...args));
  }

  /**
   * Runs `func` on a shallow clone of the state, replacing the state with the clone. The first argument to `func` will be the cloned state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate nested objects within the state.
   */
  mutate<A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ): void {
    const state = clone(this.state);
    func(state, ...args);
    this.set(state);
  }

  #assign(value: Partial<T>): void {
    this.update((state) => {
      if (isUndefined(state)) {
        throw new Error('cannot assign to undefined state');
      }

      if (
        every(value, (innerValue, key) => state[key as keyof T] === innerValue)
      ) {
        return state;
      } else {
        return { ...state, ...value };
      }
    });
  }

  protected abstract set(value: T): void;
}
