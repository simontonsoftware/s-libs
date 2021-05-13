/**
 * Converts `string`, as a whole, to lower case just like `String#toLowerCase`.
 *
 * Differences from lodash:
 * - requires `string` to be a string
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 996 bytes
 * - Micro-dash: 27 bytes
 */
export function toLower(string: string): string {
  return string.toLowerCase();
}
