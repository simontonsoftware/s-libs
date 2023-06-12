/**
 * This function returns the first argument it receives.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 69 bytes
 * - Micro-dash: 59 bytes
 */
export function identity<T>(value: T): T {
  return value;
}
