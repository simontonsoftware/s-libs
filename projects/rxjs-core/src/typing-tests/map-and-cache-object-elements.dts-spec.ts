import { identity } from '@s-libs/micro-dash';
import { Subject } from 'rxjs';
import { mapAndCacheObjectElements } from '../lib/operators';

declare const object: Subject<Record<string, number>>;
declare const objectOrNull: Subject<Record<string, number> | null>;
declare const objectOrUndefined: Subject<Record<string, number> | undefined>;
declare const objectOrNil: Subject<Record<string, number> | null | undefined>;

// $ExpectType Observable<Date[]>
object.pipe(
  mapAndCacheObjectElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
objectOrNull.pipe(
  mapAndCacheObjectElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
objectOrUndefined.pipe(
  mapAndCacheObjectElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
// $ExpectType Observable<Date[]>
objectOrNil.pipe(
  mapAndCacheObjectElements(
    identity,
    (
      // $ExpectType number
      val,
    ) => new Date(val),
  ),
);
