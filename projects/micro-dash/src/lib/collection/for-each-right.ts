import { ArrayIteratee, ObjectIteratee } from '../interfaces';
import { forOwnRightOfNonArray } from '../object/for-own-right';

/**
 * This function is like `forEach` except that it iterates over elements of `collection` from right to left.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,524 bytes
 * - Micro-dash: 245 bytes
 */

export function forEachRight<T>(
  array: readonly T[] | undefined,
  iteratee: ArrayIteratee<T, boolean | void>,
): T[];
export function forEachRight<T>(
  object: T | undefined,
  iteratee: ObjectIteratee<T, boolean | void>,
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
  iteratee: ArrayIteratee<T, boolean | void>,
): void {
  for (let i = array.length; --i >= 0; ) {
    if (iteratee(array[i], i) === false) {
      break;
    }
  }
}
