import { ArrayIteratee, ObjectIteratee } from '../interfaces';
import { forOwnRightOfNonArray } from '../object/for-own-right';

/**
 * This method is like `forEach` except that it iterates over elements of `collection` from right to left.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,760 bytes
 * - Micro-dash: 196 bytes
 */

export function forEachRight<T>(
  array: readonly T[] | undefined,
  iteratee: ArrayIteratee<T, void | boolean>,
): T[];
export function forEachRight<T>(
  object: T | undefined,
  iteratee: ObjectIteratee<T, void | boolean>,
): T;

export function forEachRight(collection: any, iteratee: any): any {
  if (Array.isArray(collection)) {
    forEachRightOfArray(collection, iteratee);
  } else {
    forOwnRightOfNonArray(collection, iteratee);
  }
  return collection;
}

export function forEachRightOfArray<T>(
  array: readonly T[],
  iteratee: ArrayIteratee<T, void | boolean>,
): void {
  for (let i = array.length; --i >= 0; ) {
    if (iteratee(array[i], i) === false) {
      break;
    }
  }
}
