/**
 * Creates a function that returns `value`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 80 bytes
 * - Micro-dash: 56 bytes
 */
export function constant<T>(value: T): () => T {
  return (): T => value;
}
