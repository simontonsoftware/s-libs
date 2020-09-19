/**
 * Returns a new set that contains the elements that are in only one of the two sets. Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
 *
 * ```ts
 * const setA = new Set([1, 2, 3, 4]);
 * const setB = new Set([3, 4, 5, 6]);
 * symmetricSetDifference(setA, setB); // Set [1, 2, 5, 6]
 * ```
 */
export function symmetricSetDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set<T>(setA);
  for (const elem of setB) {
    if (difference.has(elem)) {
      difference.delete(elem);
    } else {
      difference.add(elem);
    }
  }
  return difference;
}
