import { transform } from 'micro-dash';
import { ArrayIteratee, Nil, ObjectIteratee } from '../interfaces';

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

export function mapToObject<I, K extends keyof any, V>(
  array: I[] | Nil,
  iteratee: ArrayIteratee<I, Readonly<[K, V]>>,
): { [k in K]?: V };
export function mapToObject<T, K extends keyof any, V>(
  object: T | Nil,
  iteratee: ObjectIteratee<T, Readonly<[K, V]>>,
): { [k in K]?: V };

export function mapToObject(collection: any, iteratee: any): any {
  return transform(collection, (accumulator: any, origValue, keyOrIndex) => {
    const [key, newValue] = iteratee(origValue, keyOrIndex);
    accumulator[key] = newValue;
  });
}
