/**
 * Returns a new set that contains the elements of `setA` that are not in `setB`. Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
 *
 * ```ts
 * const setA = new Set([1, 2, 3, 4]);
 * const setB = new Set([3, 4, 5, 6]);
 * setDifference(setA, setB); // Set [1, 2]
 * ```
 */
export function setDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
}
