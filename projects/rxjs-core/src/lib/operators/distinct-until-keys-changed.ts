import { keys } from 'micro-dash';
import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isSetEqual } from 's-js-utils';

/**
 * Allows items through whose keys are distinct from the previous item.
 *
 * ```
 * source:                     |-{a:1,b:2}--{a:2,b:3}--{a:2,c:3}--{b:3}--{b:4}-|
 * distinctUntilKeysChanged(): |-{a:1,b:2}-------------{a:2,c:3}--{b:3}--------|
 * ```
 */
export function distinctUntilKeysChanged<
  T extends object
>(): MonoTypeOperatorFunction<T> {
  let lastKeySet: Set<string | keyof T> | undefined;
  return filter((value) => {
    const keySet = new Set(keys(value));
    if (lastKeySet && isSetEqual(keySet, lastKeySet)) {
      return false;
    }

    lastKeySet = keySet;
    return true;
  });
}
