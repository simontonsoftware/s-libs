/**
 * Checks if `value` is classified as a `Number` primitive.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 701 bytes
 * - Micro-dash: 56 bytes
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}
