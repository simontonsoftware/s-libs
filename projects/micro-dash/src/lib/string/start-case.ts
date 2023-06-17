import { upperFirst } from './upper-first';
import { words } from './words';

/**
 * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
 *
 * Differences from lodash:
 * - requires `string` to be a string
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 6,116 bytes
 * - Micro-dash: 335 bytes
 */
export function startCase(string: string): string {
  return words(string).map(upperFirst).join(' ');
}
