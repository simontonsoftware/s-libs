import { BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { expectSingleCallAndReset, marbleTest } from 's-ng-dev-utils';
import {
  testCompletionPropagation,
  testErrorPropagation,
} from '../../test-helpers/misc-helpers';
import { cache } from './cache';

describe('cache()', () => {
  it(
    'caches the last value emitted to give to new subscribers',
    marbleTest(({ hot, expectObservable }) => {
      const cached = hot('-a-----').pipe(cache());
      const sub1 = '      ^------';
      const expect1 = '   -a-----';
      const sub2 = '      ---^---';
      const expect2 = '   ---a---';
      const sub3 = '      -----^-';
      const expect3 = '   -----a-';

      expectObservable(cached, sub1).toBe(expect1);
      expectObservable(cached, sub2).toBe(expect2);
      expectObservable(cached, sub3).toBe(expect3);
    }),
  );

  it('does not run upstream pipe operators for new subscribers', () => {
    const upstream = jasmine.createSpy();
    const cached = new Subject().pipe(tap(upstream), cache());

    cached.subscribe();
    cached.subscribe();
    cached.subscribe();

    expect(upstream).not.toHaveBeenCalled();
  });

  it('only runs upstream operators once for any number of subscribers', () => {
    const upstream = jasmine.createSpy();
    const cached = new BehaviorSubject(1).pipe(tap(upstream), cache());

    cached.subscribe();
    cached.subscribe();
    cached.subscribe();

    expectSingleCallAndReset(upstream, 1);
  });

  it(
    'unsubscribes from the upstream observable',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('------');
      const sub1 = '      ^---! ';
      const sub2 = '      --^---!';
      const sourceSub = ' ^-----!';

      const cached = source.pipe(cache());
      expectObservable(cached, sub1).toBe('-');
      expectObservable(cached, sub2).toBe('-');
      expectSubscriptions(source.subscriptions).toBe(sourceSub);
    }),
  );

  it(
    'can resubscribe after unsubscribing',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a-----b-c-');
      const sub1 = '      ^---!       ';
      const expect1 = '   --a--       ';
      const sub2 = '      ------^-----';
      const expect2 = '   --------b-c-';

      const cached = source.pipe(cache());
      expectObservable(cached, sub1).toBe(expect1);
      expectObservable(cached, sub2).toBe(expect2);
      expectSubscriptions(source.subscriptions).toBe([sub1, sub2]);
    }),
  );

  it('passes along errors', testErrorPropagation(cache));

  it('passes along completion', testCompletionPropagation(cache));
});
