import { identity } from '@s-libs/micro-dash';
import { Subject } from 'rxjs';
import { mapAndCacheArrayElements } from '../lib/operators';

declare const array: Subject<number[]>;
declare const arrayOrNull: Subject<number[] | null>;
declare const arrayOrUndefined: Subject<number[] | undefined>;
declare const arrayOrNil: Subject<number[] | null | undefined>;

// $ExpectType Observable<Date[]>
array.pipe(
  mapAndCacheArrayElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
arrayOrNull.pipe(
  mapAndCacheArrayElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
arrayOrUndefined.pipe(
  mapAndCacheArrayElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
arrayOrNil.pipe(
  mapAndCacheArrayElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
