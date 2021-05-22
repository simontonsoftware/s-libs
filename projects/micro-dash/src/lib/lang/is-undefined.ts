/**
 * Checks if `value` is `undefined`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 83 bytes
 * - Micro-dash: 67 bytes
 */
export function isUndefined(value: any): value is undefined {
  return value === undefined;
}
