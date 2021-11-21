/**
 * This method returns the first argument it receives.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 67 bytes
 * - Micro-dash: 56 bytes
 */
export function identity<T>(value: T): T {
  return value;
}
