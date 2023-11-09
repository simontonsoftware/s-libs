/**
 * Creates an array excluding all given values.
 *
 * Differences from lodash:
 * - Uses triple equals rather than `SameValueZero`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 6,819 bytes
 * - Micro-dash: 60 bytes
 */
export function without<T>(array: readonly T[], ...values: readonly T[]): T[] {
  return array.filter((item) => !values.includes(item));
}
