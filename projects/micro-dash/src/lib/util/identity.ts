/**
 * This function returns the first argument it receives.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 51 bytes
 * - Micro-dash: 40 bytes
 */
export function identity<T>(value: T): T {
  return value;
}
