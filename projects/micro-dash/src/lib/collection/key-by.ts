import { IfIndexType, Nil, ValueIteratee } from '../interfaces';
import { forEach } from './for-each';

/**
 * Creates an object composed of keys generated from the results of running each element of `collection` thru `iteratee`. The corresponding value of each key is the last element responsible for generating the key.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 16,606 bytes
 * - Micro-dash: 305 bytes
 */

export function keyBy<T, K extends PropertyKey>(
  array: Nil | readonly T[],
  iteratee: ValueIteratee<T, K>,
): IfIndexType<K, Record<K, T>, Partial<Record<K, T>>>;
export function keyBy<T, K extends PropertyKey>(
  object: Nil | T,
  iteratee: ValueIteratee<T[keyof T], K>,
): IfIndexType<K, Record<K, T[keyof T]>, Partial<Record<K, T[keyof T]>>>;

export function keyBy(collection: any, iteratee: Function): any {
  const obj: any = {};
  forEach(collection, (value) => {
    obj[iteratee(value)] = value;
  });
  return obj;
}
