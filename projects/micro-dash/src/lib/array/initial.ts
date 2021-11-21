/**
 * Gets all but the last element of `array`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 224 bytes
 * - Micro-dash: 51 bytes
 */
export function initial<T>(array: readonly T[]): T[] {
  return array.slice(0, -1);
}
