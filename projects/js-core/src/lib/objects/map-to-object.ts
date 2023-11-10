import { transform } from '@s-libs/micro-dash';
import {
  ArrayIteratee,
  Prettify,
  Nil,
  ObjectIteratee,
  PartialExceptIndexes,
} from '../interfaces';

/**
 * Maps `collection` a new object, with keys and values determined by `iteratee`.
 *
 * ```ts
 * mapToObject([1, 2, 3], (item) => [item, item * item]);
 * // result: { 1: 1, 2: 4, 3: 9 }
 *
 * mapToObject({ a: "foo", b: "bar" }, (item, key) => [item, key.toUpperCase()]);
 * // result: { foo: "A", bar: "B" }
 * ```
 */

// `Prettify` is not just for looks. It also works around an apparent bug in expect-type for the tests.

export function mapToObject<I, K extends keyof any, V>(
  array: Nil | readonly I[],
  iteratee: ArrayIteratee<I, Readonly<[K, V]>>,
): Prettify<PartialExceptIndexes<{ [k in K]: V }>>;
export function mapToObject<T, K extends keyof any, V>(
  object: Nil | T,
  iteratee: ObjectIteratee<T, Readonly<[K, V]>>,
): Prettify<PartialExceptIndexes<{ [k in K]: V }>>;

export function mapToObject(collection: any, iteratee: any): any {
  return transform(collection, (accumulator: any, origValue, keyOrIndex) => {
    const [key, newValue] = iteratee(origValue, keyOrIndex);
    accumulator[key] = newValue;
  });
}
