/**
 * This function is like `clone` except that it recursively clones `value`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,222 bytes
 * - Micro-dash: 59 bytes
 */
export function cloneDeep<T>(value: T): T {
  return structuredClone(value);
}
