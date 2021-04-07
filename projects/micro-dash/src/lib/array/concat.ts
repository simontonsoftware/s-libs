/**
 * Creates a new array concatenating `array` with any additional arrays and/or values.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,410 bytes
 * - Micro-dash: 36 bytes
 */
export function concat<T>(
  array: readonly T[],
  ...values: Array<T | readonly T[]>
): T[] {
  return array.concat(...values);
}
