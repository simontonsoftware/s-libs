/**
 * Flattens `array` a single level deep.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,283 bytes
 * - Micro-dash: 138 bytes
 */
export function flatten<T>(array: ReadonlyArray<T | readonly T[]>): T[] {
  const result: any[] = [];
  for (const element of array) {
    if (Array.isArray(element)) {
      for (const inner of element) {
        result.push(inner);
      }
    } else {
      result.push(element);
    }
  }
  return result;
}
