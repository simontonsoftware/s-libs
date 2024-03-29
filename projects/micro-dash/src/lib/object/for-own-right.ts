import { forEachRightOfArray } from '../collection/for-each-right';
import { ObjectIteratee } from '../interfaces';
import { keys, keysOfNonArray } from './keys';

/**
 * This function is like `forOwn` except that it iterates over properties of `object` in the opposite order.
 *
 * Differences from lodash:
 * - does not treat sparse arrays as dense
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,214 bytes
 * - Micro-dash: 261 bytes
 */
export function forOwnRight<T>(
  object: T,
  iteratee: ObjectIteratee<T, boolean | void>,
): T {
  forEachRightOfArray(keys(object), (key) =>
    iteratee(object[key as keyof T], key),
  );
  return object;
}

export function forOwnRightOfNonArray<T>(
  object: T,
  iteratee: ObjectIteratee<T, boolean | void>,
): T {
  forEachRightOfArray(keysOfNonArray(object), (key) =>
    iteratee(object[key as keyof T], key),
  );
  return object;
}
