/**
 * Checks if `value` is classified as a String primitive.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 861 bytes
 * - Micro-dash: 98 bytes
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}
