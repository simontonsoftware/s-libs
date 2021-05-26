import { forEachOfArray } from '../collection/for-each';
import { Existent, Primitive, ValueIteratee } from '../interfaces';

export function findExtreme<T extends Existent>(
  array: readonly T[],
  iteratee: ValueIteratee<T, Primitive>,
  shouldReplace: (candidate: Primitive, current: Primitive) => boolean,
): T {
  let current: T | undefined;
  let currentCriterion: Primitive;
  forEachOfArray(array, (candidate) => {
    const candidateCriterion = iteratee(candidate);
    if (
      current === undefined ||
      shouldReplace(candidateCriterion, currentCriterion)
    ) {
      current = candidate;
      currentCriterion = candidateCriterion;
    }
  });
  return current!;
}
