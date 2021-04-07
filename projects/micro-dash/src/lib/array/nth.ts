import { Nil } from '../interfaces';

/**
 * Gets the element at index `n` of `array`. If `n` is negative, the nth element from the end is returned.
 *
 * Differences from lodash:
 * - does not handle a fractional value for `index`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,533 bytes
 * - Micro-dash: 96 bytes
 */

export function nth<T>(array: readonly T[], index: number): T;
export function nth<T>(array: readonly T[] | Nil, index: number): T | undefined;

export function nth<T>(
  array: readonly T[] | Nil,
  index: number,
): T | undefined {
  if (array) {
    return array[index < 0 ? array.length + index : index];
  }
}
