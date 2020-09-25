import { flow } from 'micro-dash';
import { Observable, OperatorFunction } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

/**
 * Emits the latest value of the given Observable every time the source Observable emits a value.
 *
 * ```
 * source:               -1---2--3------4-|
 * inner:                ---a------b--c---|
 * mapToLastFrom(inner): -----a--a------c-|
 * ```
 */
export function mapToLatestFrom<T>(
  inner$: Observable<T>,
): OperatorFunction<any, T> {
  return flow(
    withLatestFrom(inner$),
    map(([_, inner]) => inner),
  );
}
