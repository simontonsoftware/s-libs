import { ArrayIteratee, ObjectIteratee } from '../interfaces';
import { forEach } from './for-each';

/**
 * Checks if `predicate` returns truty for **all** elements of `collection`. Iteration is stopped once predicate returns falsey.
 *
 * **Note:** This function returns `true` for [empty collections](https://en.wikipedia.org/wiki/Empty_set) because [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of elements of empty collections.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 16,503 bytes
 * - Micro-dash: 323 bytes
 */

export function every<T>(
  array: readonly T[] | undefined,
  predicate: ArrayIteratee<T, any>,
): boolean;
export function every<T>(
  object: T | undefined,
  predicate: ObjectIteratee<T, any>,
): boolean;

export function every(collection: any, predicate: any): boolean {
  let result = true;
  forEach(
    collection,
    (value, keyOrIndex) => (result = !!predicate(value, keyOrIndex)),
  );
  return result;
}
