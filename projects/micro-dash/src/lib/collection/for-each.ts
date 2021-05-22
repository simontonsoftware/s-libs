import { ArrayIteratee, Nil, ObjectIteratee } from '../interfaces';
import { forOwnOfNonArray } from '../object/for-own';

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element. Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,781 bytes
 * - Micro-dash: 200 bytes
 */

export function forEach<T extends readonly any[] | Nil>(
  array: T,
  iteratee: ArrayIteratee<NonNullable<T>[number], void | boolean>,
): T;
export function forEach<T>(
  object: T,
  iteratee: ObjectIteratee<NonNullable<T>, void | boolean>,
): T;

export function forEach(collection: any, iteratee: any): any {
  if (Array.isArray(collection)) {
    forEachOfArray(collection, iteratee);
  } else {
    forOwnOfNonArray(collection, iteratee);
  }
  return collection;
}

/** @hidden */
export function forEachOfArray<T>(
  array: readonly T[],
  iteratee: ArrayIteratee<T, void | boolean>,
): void {
  for (let i = 0, len = array.length; i < len; ++i) {
    if (iteratee(array[i], i) === false) {
      break;
    }
  }
}
