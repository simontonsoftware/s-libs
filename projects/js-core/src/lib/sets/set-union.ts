/**
 * Returns a new set that contains the elements that are in either `setA` or `setB`. Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
 *
 * ```ts
 * const setA = new Set([1, 2, 3, 4]);
 * const setB = new Set([3, 4, 5, 6]);
 * setUnion(setA, setB); // Set [1, 2, 3, 4, 5, 6]
 * ```
 */
export function setUnion<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const union = new Set<T>(setA);
  for (const elem of setB) {
    if (!setA.has(elem)) {
      union.add(elem);
    }
  }
  return union;
}
