import { ArrayIteratee, ArrayNarrowingIteratee } from '../interfaces';

/**
 * Removes all elements from array for which `predicate` returns truthy, and returns an array of the removed elements.
 *
 * Differences from lodash:
 * - iterates over `array` in reverse order
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 16,363 bytes
 * - Micro-dash: 118 bytes
 */

export function remove<O>(
  array: any[],
  predicate: ArrayNarrowingIteratee<O>,
): O[];
export function remove<T>(
  array: T[],
  predicate: ArrayIteratee<T, boolean>,
): T[];

export function remove<T>(
  array: T[],
  predicate: ArrayIteratee<T, boolean>,
): T[] {
  const removed: T[] = [];
  for (let i = array.length; --i >= 0; ) {
    if (predicate(array[i], i)) {
      removed.unshift(array[i]);
      array.splice(i, 1);
    }
  }
  return removed;
}
