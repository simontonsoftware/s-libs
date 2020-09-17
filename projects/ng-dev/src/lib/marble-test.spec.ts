import { of } from 'rxjs';
import { concatMap, delay, throttleTime } from 'rxjs/operators';
import { marbleTest } from './marble-test';

describe('marbleTest()', () => {
  // https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/testing/marble-testing.md
  it(
    'works for the first example in the docs',
    marbleTest(
      ({ cold, expectObservable, expectSubscriptions, testScheduler }) => {
        const e1 = cold(' -a--b--c---|');
        const subs = '    ^----------!';
        const expected = '-a-----c---|';

        expectObservable(e1.pipe(throttleTime(3, testScheduler))).toBe(
          expected,
        );
        expectSubscriptions(e1.subscriptions).toBe(subs);
      },
    ),
  );

  it(
    'works for two tests in a row',
    marbleTest(({ cold, expectObservable }) => {
      const input = ' -a-b-c|';
      const expected = '-- 9ms a 9ms b 9ms (c|)';

      const result = cold(input).pipe(concatMap((d) => of(d).pipe(delay(10))));

      expectObservable(result).toBe(expected);
    }),
  );
});
