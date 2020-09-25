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

describe('mapAndCacheArrayElements()', () => {
  it('maps over the array using the given function', async () => {
    await expectPipeResult(
      [
        [1, 2, 3, 4, 5, 6],
        [1, 2, 5, 6],
        [1, 2, 5, 6, 10],
      ],
      mapAndCacheArrayElements(identity, (item) => item * 3),
      [
        [3, 6, 9, 12, 15, 18],
        [3, 6, 15, 18],
        [3, 6, 15, 18, 30],
      ],
    );
  });

  it('emits the same object reference for items that have the same cache key', () => {
    const source = new Subject<Array<{ index: number }>>();
    const next = jasmine.createSpy();

    source
      .pipe(
        mapAndCacheArrayElements(
          (item) => item.index,
          (item) => ({ index: item.index + 1 }),
        ),
      )
      .subscribe(next);

    source.next([{ index: 1 }]);
    const emission1 = next.calls.mostRecent().args[0];

    source.next([{ index: 1 }, { index: 2 }]);
    const emission2 = next.calls.mostRecent().args[0];

    expect(next).toHaveBeenCalledTimes(2);
    expect(emission1).toEqual([{ index: 2 }]);
    expect(emission2).toEqual([{ index: 2 }, { index: 3 }]);
    expect(emission1[0]).toBe(emission2[0]);
  });

  it('does not call `buildDownstreamItem` if there is a match in the cache', () => {
    const source = new Subject<number[]>();
    const buildDownstreamItem = jasmine.createSpy();

    source
      .pipe(mapAndCacheArrayElements(identity, buildDownstreamItem))
      .subscribe();

    source.next([10]);
    expectSingleCallAndReset(buildDownstreamItem, 10, 0);

    source.next([10, 15]);
    expectSingleCallAndReset(buildDownstreamItem, 15, 1);
  });

  it('only calls `buildDownstreamItem` once for a given cache key', () => {
    const source = new Subject<number[]>();
    const buildDownstreamItem = jasmine.createSpy();

    source
      .pipe(mapAndCacheArrayElements(identity, buildDownstreamItem))
      .subscribe();

    source.next([5, 5, 5, 20]);
    expect(buildDownstreamItem).toHaveBeenCalledTimes(2);
    expect(buildDownstreamItem).toHaveBeenCalledWith(5, 0);
    expect(buildDownstreamItem).toHaveBeenCalledWith(20, 3);

    buildDownstreamItem.calls.reset();
    source.next([5, 5, 5, 20, 25, 25]);
    expect(buildDownstreamItem).toHaveBeenCalledTimes(1);
    expect(buildDownstreamItem).toHaveBeenCalledWith(25, 4);
  });

  it('always returns the same object reference for a given cache key', () => {
    const source = new Subject<Array<{ index: number }>>();
    const next = jasmine.createSpy();

    source
      .pipe(
        mapAndCacheArrayElements(
          (item) => item.index,
          (item) => ({ index: item.index + 1 }),
        ),
      )
      .subscribe(next);

    source.next([{ index: 1 }, { index: 1 }]);
    const emission1 = next.calls.mostRecent().args[0];

    source.next([{ index: 1 }, { index: 1 }, { index: 1 }]);
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
      [1],
    ),
  );

  it(
    'handles `buildDownstreamType` throwing an error',
    testUserFunctionError(
      (thrower) => mapAndCacheArrayElements(identity, thrower),
      [1],
    ),
  );

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() =>
      mapAndCacheArrayElements(identity, identity),
    ),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => mapAndCacheArrayElements(identity, identity)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() =>
      mapAndCacheArrayElements(identity, identity),
    ),
  );
});
