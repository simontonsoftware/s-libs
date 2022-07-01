import { Nil } from '../interfaces';
import { keys } from '../object';

/**
 * Gets the size of collection by returning the number of its own enumerable string keyed properties.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,569 bytes
 * - Micro-dash: 233 bytes
 */
export function size(
  collection: object | string | readonly any[] | Nil,
): number {
  return keys(collection).length;
}
