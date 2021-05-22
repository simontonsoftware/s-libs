/**
 * Flattens `array` a single level deep.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,229 bytes
 * - Micro-dash: 25 bytes
 */
export function flatten<T>(array: ReadonlyArray<T | readonly T[]>): T[] {
  return ([] as T[]).concat(...array);
}
