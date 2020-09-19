/**
 * Returns whether `set` contains all the elements in `subset`. Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
 *
 * ```ts
 * const setA = new Set([1, 2, 3, 4]);
 * const setB = new Set([3, 4]);
 * setUnion(setA, setB); // true
 * ```
 */
export function isSuperset(set: Set<any>, subset: Set<any>): boolean {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}
