import { Nil } from '../interfaces';
import { sampleSize } from './sample-size';
import { size } from './size';

/**
 * Creates an array of shuffled values, using a version of the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle).
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,846 bytes
 * - Micro-dash: 842 bytes
 */

export function shuffle<T>(array: T[] | Nil): T[];
export function shuffle<T>(object: T | Nil): Array<T[keyof T]>;

export function shuffle(collection: any): any {
  return sampleSize(collection, size(collection));
}
