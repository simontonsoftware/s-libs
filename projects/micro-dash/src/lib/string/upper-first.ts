import { Nil } from '../interfaces';

/**
 * Converts the first character of `string` to upper case.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,974 bytes
 * - Micro-dash: 93 bytes
 */
export function upperFirst(string: string | Nil): string {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}
