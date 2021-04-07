/**
 * Flattens `array` a single level deep.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,183 bytes
 * - Micro-dash: 29 bytes
 */
export function flatten<T>(array: ReadonlyArray<T | readonly T[]>): T[] {
  return ([] as T[]).concat(...array);
}
