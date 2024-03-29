import { pullAll } from './pull-all';

/**
 * Removes all given values from array using `SameValueZero` for equality comparisons.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,634 bytes
 * - Micro-dash: 217 bytes
 */
export function pull<T>(array: T[], ...values: T[]): T[] {
  return pullAll(array, values);
}
