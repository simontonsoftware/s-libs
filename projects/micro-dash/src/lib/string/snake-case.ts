import { toLower } from './to-lower';
import { words } from './words';

/**
 * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case)
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,102 bytes
 * - Micro-dash: 327 bytes
 */
export function snakeCase(string: string): string {
  return words(string).map(toLower).join('_');
}
