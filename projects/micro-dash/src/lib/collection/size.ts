import { Nil } from '../interfaces';
import { keys } from '../object';

/**
 * Gets the size of collection by returning the number of its own enumerable string keyed properties.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,103 bytes
 * - Micro-dash: 214 bytes
 */
export function size(
  collection: Nil | object | string | readonly any[],
): number {
  return keys(collection).length;
}
