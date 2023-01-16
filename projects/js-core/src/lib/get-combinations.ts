/**
 * Gets all combinations of `n`  elements from `array`.
 *
 * ```ts
 * getCombinations([1, 2, 3], 2);
 * // [
 * //  [1, 2],
 * //  [1, 3],
 * //  [2, 3],
 * // ]
 * ```
 */

export function getCombinations<T>(array: readonly T[], n: 1): Array<[T]>;
export function getCombinations<T>(array: readonly T[], n: 2): Array<[T, T]>;
export function getCombinations<T>(array: readonly T[], n: 3): Array<[T, T, T]>;
export function getCombinations<T>(
  array: readonly T[],
  n: 4,
): Array<[T, T, T, T]>;
export function getCombinations<T>(array: readonly T[], n: number): T[][];

export function getCombinations<T>(array: readonly T[], n: number): T[][] {
  if (n % 1 !== 0) {
    throw new Error('`length` must be a whole number');
  }

  if (n > array.length) {
    return [];
  }

  const results: T[][] = [];
  const result: T[] = [];
  result.length = n;
  combine(n, 0);
  return results;

  function combine(len: number, start: number): void {
    if (len === 0) {
      results.push(result.slice());
      return;
    }

    for (let i = start; i <= array.length - len; i++) {
      result[result.length - len] = array[i];
      combine(len - 1, i + 1);
    }
  }
}
