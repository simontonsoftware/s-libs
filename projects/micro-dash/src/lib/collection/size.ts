import { keys } from '../object';

/**
 * Gets the size of collection by returning the number of its own enumerable string keyed properties.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,518 bytes
 * - Micro-dash: 231 bytes
 */

export function size(collection: object): number;
export function size(collection: string | readonly any[]): number;

export function size(collection: object | string | readonly any[]): number {
  return keys(collection).length;
}
