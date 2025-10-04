import { CallableObject, WeakValueMap } from '@s-libs/js-core';
import { clone, every, isUndefined } from '@s-libs/micro-dash';
import { Key } from './interfaces';
import { GetSlice, Slice, Store } from './store';

export interface AbstractStore<T> {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type -- this syntax is required to merge with the class below
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

  #children = new WeakValueMap<keyof NonNullable<T>, Store<any>>();

  abstract state: T;

  constructor(makeChild: (childKey: Key) => Store<any>) {
    super((childKey): any => {
      let child = this.#children.get(childKey);
      if (child === undefined) {
        child = makeChild(childKey as Key);
        this.#children.set(childKey, child);
      }
      return child;
    });
  }

  get nonNull(): Store<NonNullable<T>> {
    return this as unknown as Store<NonNullable<T>>;
  }

  /**
   * Runs `func` on the state and replaces it with the return value. The first argument to `func` will be the state, followed by the arguments in `args`.
   *
   * WARNING: You SHOULD NOT use a function that will mutate the state.
   */
  update<A extends any[]>(func: (state: T, ...args: A) => T, ...args: A): void {
    this.state = func(this.state, ...args);
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
    this.state = state;
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
}
