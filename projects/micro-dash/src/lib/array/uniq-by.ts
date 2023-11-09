import { ValueIteratee } from '../interfaces';

/**
 * This function is like `_.uniq` except that it accepts `iteratee` which is invoked for each element in `array` to generate the criterion by which uniqueness is computed. The order of result values is determined by the order they occur in the array.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 16,671 bytes
 * - Micro-dash: 122 bytes
 */
export function uniqBy<T>(
  array: readonly T[],
  iteratee: ValueIteratee<T, any>,
): T[] {
  const seen = new Set<T>();
  return array.filter((element) => {
    const key = iteratee(element);
    const isNew = !seen.has(key);
    seen.add(key);
    return isNew;
  });
}
