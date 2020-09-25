import { identity } from 'micro-dash';
import { Subject } from 'rxjs';
import { expectSingleCallAndReset } from 's-ng-dev-utils';
import {
  expectPipeResult,
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
  testUserFunctionError,
} from '../../test-helpers/misc-helpers';
import { mapAndCacheArrayElements } from './map-and-cache-array-elements';
import { mapAndCacheObjectElements } from './map-and-cache-object-elements';

type ObjectWith<T> = Record<string, T>;

describe('mapAndCacheObjectElements()', () => {
  it('maps over the object using the given function', async () => {
    await expectPipeResult<ObjectWith<number>, number[]>(
      [
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2, e: 5 },
        { a: 1, e: 5, f: 6 },
      ],
      mapAndCacheObjectElements(identity, (item) => item * 3),
      [
        [3, 6, 9],
        [3, 6, 15],
        [3, 15, 18],
      ],
    );
  });

  it('emits the same object reference for items that have the same cache key', () => {
    const source = new Subject<ObjectWith<{ index: number }>>();
    const next = jasmine.createSpy();

    source
      .pipe(
        mapAndCacheObjectElements(
          (_item, key) => key,
          (item) => ({ index: item.index + 1 }),
        ),
      )
      .subscribe(next);

    source.next({ a: { index: 1 } });
    const emission1 = next.calls.mostRecent().args[0];

    source.next({ a: { index: 1 }, b: { index: 2 } });
    const emission2 = next.calls.mostRecent().args[0];

    expect(next).toHaveBeenCalledTimes(2);
    expect(emission1).toEqual([{ index: 2 }]);
    expect(emission2).toEqual([{ index: 2 }, { index: 3 }]);
    expect(emission1[0]).toBe(emission2[0]);
  });

  it('does not call `buildDownstreamItem` if there is a match in the cache', () => {
    const source = new Subject<ObjectWith<number>>();
    const buildDownstreamItem = jasmine.createSpy();

    source
      .pipe(mapAndCacheObjectElements(identity, buildDownstreamItem))
      .subscribe();

    source.next({ a: 10 });
    expectSingleCallAndReset(buildDownstreamItem, 10, 'a');

    source.next({ a: 10, b: 15 });
    expectSingleCallAndReset(buildDownstreamItem, 15, 'b');
  });

  it('only calls `buildDownstreamItem` once for a given cache key', () => {
    const source = new Subject<ObjectWith<number>>();
    const buildDownstreamItem = jasmine.createSpy();

    source
      .pipe(mapAndCacheObjectElements(identity, buildDownstreamItem))
      .subscribe();

    source.next({ a: 5, b: 5, c: 5, d: 20 });
    expect(buildDownstreamItem).toHaveBeenCalledTimes(2);
    expect(buildDownstreamItem).toHaveBeenCalledWith(5, 'a');
    expect(buildDownstreamItem).toHaveBeenCalledWith(20, 'd');

    buildDownstreamItem.calls.reset();
    source.next({ a: 5, b: 5, c: 5, d: 20, e: 25, f: 25 });
    expect(buildDownstreamItem).toHaveBeenCalledTimes(1);
    expect(buildDownstreamItem).toHaveBeenCalledWith(25, 'e');
  });

  it('always returns the same object reference for a given cache key', () => {
    const source = new Subject<ObjectWith<{ index: number }>>();
    const next = jasmine.createSpy();

    source
      .pipe(
        mapAndCacheObjectElements(
          (item) => item.index,
          (item) => ({ index: item.index + 1 }),
        ),
      )
      .subscribe(next);

    source.next({ a: { index: 1 }, b: { index: 1 } });
    const emission1 = next.calls.mostRecent().args[0];

    source.next({ c: { index: 1 }, d: { index: 1 }, e: { index: 1 } });
    const emission2 = next.calls.mostRecent().args[0];

    expect(next).toHaveBeenCalledTimes(2);
    for (const value of [...emission1, ...emission2]) {
      expect(value).toBe(emission1[0]);
    }
  });

  it(
    'handles `buildCacheKey` throwing an error',
    testUserFunctionError(
      (thrower) => mapAndCacheArrayElements(thrower, identity),
      { a: 1 },
    ),
  );

  it(
    'handles `buildDownstreamType` throwing an error',
    testUserFunctionError(
      (thrower) => mapAndCacheArrayElements(identity, thrower),
      { a: 1 },
    ),
  );

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() =>
      mapAndCacheObjectElements(identity, identity),
    ),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => mapAndCacheObjectElements(identity, identity)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() =>
      mapAndCacheObjectElements(identity, identity),
    ),
  );
});
