import { keys } from '@s-libs/micro-dash';
import { marbleTest } from '@s-libs/ng-dev';
import * as rxjsCore from '@s-libs/rxjs-core';
import {
  cache,
  createOperatorFunction,
  delayOnMicrotaskQueue,
  distinctUntilKeysChanged,
  filterBehavior,
  logValues,
  mapAndCacheArrayElements,
  mapAndCacheObjectElements,
  mapToLatestFrom,
  skipAfter,
  SubscriptionManager,
  withHistory,
} from '@s-libs/rxjs-core';
import { Subject } from 'rxjs';
import { subscribeWithStubs } from '../../../../rxjs-core/src/test-helpers/misc-helpers';

describe('rxjs-core', () => {
  describe('public API', () => {
    it('has SubscriptionManager', () => {
      expect(SubscriptionManager).toBeDefined();
    });

    it('has mapAndCacheArrayElements', () => {
      expect(mapAndCacheArrayElements).toBeDefined();
    });

    it('has mapAndCacheObjectElements', () => {
      expect(mapAndCacheObjectElements).toBeDefined();
    });

    it('has cache', () => {
      expect(cache).toBeDefined();
    });

    it('has createOperatorFunction', () => {
      expect(createOperatorFunction).toBeDefined();
    });

    it('has delayOnMicrotaskQueue', () => {
      expect(delayOnMicrotaskQueue).toBeDefined();
    });

    it('has distinctUntilKeysChanged', () => {
      expect(distinctUntilKeysChanged).toBeDefined();
    });

    it('has filterBehavior', () => {
      expect(filterBehavior).toBeDefined();
    });

    it('has logValues', () => {
      expect(logValues).toBeDefined();
    });

    it('has mapToLatestFrom', () => {
      expect(mapToLatestFrom).toBeDefined();
    });

    it('has skipAfter', () => {
      expect(skipAfter).toBeDefined();
    });

    it('has withHistory', () => {
      expect(withHistory).toBeDefined();
    });
  });

  describe('as a UMD bundle', () => {
    const bundle: typeof rxjsCore = (window as any).sLibs.rxjsCore;

    it('is available at sLibs.rxjsCore', () => {
      expect(keys(bundle)).toEqual(
        jasmine.arrayWithExactContents(keys(rxjsCore)),
      );
    });

    it(
      'knows where to find micro-dash',
      marbleTest(({ cold, expectObservable, expectSubscriptions }) => {
        // mapToLatestFrom() uses micro-dash. This is one of its tests

        const source = cold('-1---2--3------4-|');
        const inner = cold(' ---a------b--c----');
        const subs = '       ^----------------!';
        const expected = '   -----a--a------c-|';

        expectObservable(source.pipe(bundle.mapToLatestFrom(inner))).toBe(
          expected,
        );
        expectSubscriptions(source.subscriptions).toBe(subs);
        expectSubscriptions(inner.subscriptions).toBe(subs);
      }),
    );

    it('knows where to find js-core', () => {
      // distinctUntilKeysChanged() uses js-core. This is one of its tests

      const source = new Subject<Record<string, number>>();
      const sub = subscribeWithStubs(
        source.pipe(bundle.distinctUntilKeysChanged()),
      );

      source.next({ a: 1, b: 2 });
      sub.expectReceivedOnlyValue({ a: 1, b: 2 });

      source.next({ a: 3, b: 4 });
      sub.expectNoCalls();

      source.next({ a: 5, b: 6, c: 7 });
      sub.expectReceivedOnlyValue({ a: 5, b: 6, c: 7 });

      source.next({ a: 5, b: 6, d: 7 });
      sub.expectReceivedOnlyValue({ a: 5, b: 6, d: 7 });

      source.next({ a: 5, b: 6 });
      sub.expectReceivedOnlyValue({ a: 5, b: 6 });

      source.next({ a: 1, b: 2 });
      sub.expectNoCalls();
    });
  });
});
