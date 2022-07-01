import { Nil } from '../interfaces';
import { times } from '../util';

/**
 * Creates an array of grouped elements, the first of which contains the first elements of the given arrays, the second of which contains the second elements of the given arrays, and so on.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,137 bytes
 * - Micro-dash: 210 bytes
 */

export function zip<T1, T2>(
  array1: readonly T1[],
  array2: readonly T2[],
): Array<[T1, T2]>;
export function zip<T1, T2, T3>(
  array1: readonly T1[],
  array2: readonly T2[],
  array3: readonly T3[],
): Array<[T1, T2, T3]>;
export function zip<T1, T2, T3, T4>(
  array1: readonly T1[],
  array2: readonly T2[],
  array3: readonly T3[],
  array4: readonly T4[],
): Array<[T1, T2, T3, T4]>;
export function zip<T>(...arrays: readonly T[][]): T[][];
export function zip<T>(
  ...arrays: ReadonlyArray<Nil | readonly T[]>
): Array<Array<Nil | T>>;

export function zip<T>(
  ...arrays: ReadonlyArray<Nil | readonly T[]>
): Array<Array<Nil | T>> {
  const length = Math.max(0, ...arrays.map((a) => (a ? a.length : 0)));
  return times(length, (i) => arrays.map((a) => (a ? a[i] : undefined)));
}
