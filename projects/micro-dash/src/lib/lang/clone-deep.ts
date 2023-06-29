/**
 * This function is like `clone` except that it recursively clones `value`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 12,696 bytes
 * - Micro-dash: 79 bytes
 */
export function cloneDeep<T>(value: T): T {
  return structuredClone(value);
}
