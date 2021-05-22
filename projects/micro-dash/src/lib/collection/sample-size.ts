import { pullAt } from '../array';
import { Nil } from '../interfaces';
import { randomInt } from '../math/random';
import { identity, times } from '../util';
import { map } from './map';

/**
 * Gets `n` random elements at unique keys from `collection` up to the size of `collection`.
 *
 * Differences from lodash:
 * - no special treatment given to fraction values of `n`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,853 bytes
 * - Micro-dash: 616 bytes
 */

export function sampleSize<T>(array: readonly T[] | Nil, n?: number): T[];
export function sampleSize<T>(object: T | Nil, n?: number): Array<T[keyof T]>;

export function sampleSize(collection: any, n = 1): any[] {
  const values = map(collection, identity);
  return times(
    Math.min(n, values.length),
    () => pullAt(values, randomInt(0, values.length - 1, false))[0],
  );
}
