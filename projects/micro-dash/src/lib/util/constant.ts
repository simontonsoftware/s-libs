/**
 * Creates a function that returns `value`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 72 bytes
 * - Micro-dash: 65 bytes
 */
export function constant<T>(value: T): () => T {
  return (): T => value;
}
