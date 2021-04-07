import { flatten } from '../array';
import { ArrayIteratee, Nil, ObjectIteratee } from '../interfaces';
import { map } from './map';

/**
 * Creates a flattened array of values by running each element in `collection` thru `iteratee` and flattening the mapped results.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,246 bytes
 * - Micro-dash: 369 bytes
 */

export function flatMap<I, O>(
  array: readonly I[] | Nil,
  iteratee: ArrayIteratee<I, O | O[]>,
): O[];
export function flatMap<T, O>(
  object: T | Nil,
  iteratee: ObjectIteratee<T, O | O[]>,
): O[];

export function flatMap(collection: any, iteratee: any): any {
  return flatten(map(collection, iteratee));
}
