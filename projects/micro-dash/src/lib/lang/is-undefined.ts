/**
 * Checks if `value` is `undefined`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 81 bytes
 * - Micro-dash: 76 bytes
 */
export function isUndefined(value: any): value is undefined {
  return value === undefined;
}
