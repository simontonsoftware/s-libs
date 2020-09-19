/**
 * Returns a new set that contains the elements that are in both `setA` and `setB`. Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
 *
 * ```ts
 * const setA = new Set([1, 2, 3, 4]);
 * const setB = new Set([3, 4, 5, 6]);
 * setIntersection(setA, setB); // Set [3, 4]
 * ```
 */
export function setIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const intersection = new Set<T>();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
}
