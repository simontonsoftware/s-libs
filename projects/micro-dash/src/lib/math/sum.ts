/**
 * Computes the sum of the values in `array`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 217 bytes
 * - Micro-dash: 66 bytes
 */
export function sum(array: number[]): number {
  return array.reduce((s, value) => s + value, 0);
}
