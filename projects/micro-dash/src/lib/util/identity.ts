/**
 * This method returns the first argument it receives.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 39 bytes
 * - Micro-dash: 39 bytes
 */
export function identity<T>(value: T): T {
  return value;
}
