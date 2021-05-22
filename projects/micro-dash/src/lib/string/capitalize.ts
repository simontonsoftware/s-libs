import { upperFirst } from './upper-first';

/**
 * Converts the first character of `string` to upper case and the remaining to lower case.
 *
 * Differences from lodash:
 * - requires `string` to be a string
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,971 bytes
 * - Micro-dash: 73 bytes
 */
export function capitalize(string: string): string {
  return upperFirst(string.toLowerCase());
}
