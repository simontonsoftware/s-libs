import { ArrayIteratee, EmptyObject, Nil, ObjectIteratee } from '../interfaces';
import { mapToObject } from './map-to-object';

/**
 * Maps `collection` to be the keys of a new object, with the values determined by `iteratee`.
 *
 * ```ts
 * mapAsKeys([1, 2, 3], (item) => item * item);
 * // result: { 1: 1, 2: 4, 3: 9 }
 *
 * mapAsKeys({ a: "foo", b: "bar" }, (_item, key) => key.toUpperCase());
 * // result: { foo: "A", bar: "B" }
 * ```
 */

export function mapAsKeys<K extends keyof any, V>(
  array: K[],
  iteratee: ArrayIteratee<K, V>,
): Record<K, V>;
export function mapAsKeys<K extends keyof any, V>(
  array: K[] | Nil,
  iteratee: ArrayIteratee<K, V>,
): EmptyObject | Record<K, V>;
export function mapAsKeys<T extends Record<keyof T, keyof any>, V>(
  object: T,
  iteratee: ObjectIteratee<T, V>,
): Record<T[keyof T], V>;
export function mapAsKeys<T extends Record<keyof T, keyof any>, V>(
  object: Nil | T,
  iteratee: ObjectIteratee<T, V>,
): EmptyObject | Record<T[keyof T], V>;

export function mapAsKeys(collection: any, iteratee: any): any {
  return mapToObject(collection, (value, keyOrIndex) => [
    value,
    iteratee(value, keyOrIndex),
  ]);
}
