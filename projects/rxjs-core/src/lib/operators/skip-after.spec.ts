import { marbleTest } from 's-ng-dev-utils';
import { skipAfter } from './skip-after';

describe('skipAfter()', () => {
  it(
    'causes the next emission to be skipped',
    marbleTest(({ hot, expectObservable }) => {
      const source = hot('-a---b-c-');
      const skip$ = hot(' ---x-----');
      const expected = '  -a-----c-';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
    }),
  );

  it(
    'only skips one emission even if called multiple times',
    marbleTest(({ hot, expectObservable }) => {
      const source = hot('-a-----b-c-');
      const skip$ = hot(' ---x-x-----');
      const expected = '  -a-------c-';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
    }),
  );

  it(
    'passes along unsubscribes',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-');
      const skip$ = hot('-');
      const sub1 = '^---!  ';
      const sub2 = '--^---!';

      expectObservable(source.pipe(skipAfter(skip$)), sub1).toBe('-');
      expectObservable(source.pipe(skipAfter(skip$)), sub2).toBe('-');
      expectSubscriptions(source.subscriptions).toBe([sub1, sub2]);
      expectSubscriptions(skip$.subscriptions).toBe([sub1, sub2]);
    }),
  );

  it(
    'passes along source errors',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-#');
      const skip$ = hot(' --');
      const subs = '      ^!';
      const expected = '  -#';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(skip$.subscriptions).toBe(subs);
    }),
  );

  it(
    'passes along skip$ errors',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--');
      const skip$ = hot(' -#');
      const subs = '      ^!';
      const expected = '  -#';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(skip$.subscriptions).toBe(subs);
    }),
  );

  it(
    'passes along source completion',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-|');
      const skip$ = hot(' --');
      const subs = '      ^!';
      const expected = '  -|';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(skip$.subscriptions).toBe(subs);
    }),
  );

  it(
    'continues working after skip$ completion',
    marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a-b-');
      const skip$ = hot(' -|     ');
      const expected = '  ---a-b-';
      const sourceSub = ' ^------';
      const skipSub = '   ^!     ';

      expectObservable(source.pipe(skipAfter(skip$))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSub);
      expectSubscriptions(skip$.subscriptions).toBe(skipSub);
    }),
  );
});
