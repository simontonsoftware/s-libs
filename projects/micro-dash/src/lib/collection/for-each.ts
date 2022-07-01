import { ArrayIteratee, Nil, ObjectIteratee } from '../interfaces';
import { forOwnOfNonArray } from '../object/for-own';

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element. Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,036 bytes
 * - Micro-dash: 257 bytes
 */

export function forEach<T extends Nil | readonly any[]>(
  array: T,
  iteratee: ArrayIteratee<NonNullable<T>[number], boolean | void>,
): T;
export function forEach<T>(
  object: T,
  iteratee: ObjectIteratee<NonNullable<T>, boolean | void>,
): T;

export function forEach(collection: any, iteratee: any): any {
  if (Array.isArray(collection)) {
    forEachOfArray(collection, iteratee);
  } else {
    forOwnOfNonArray(collection, iteratee);
  }
  return collection;
}

export function forEachOfArray<T>(
  array: readonly T[],
  iteratee: ArrayIteratee<T, boolean | void>,
): void {
  for (let i = 0, len = array.length; i < len; ++i) {
    if (iteratee(array[i], i) === false) {
      break;
    }
  }
}
