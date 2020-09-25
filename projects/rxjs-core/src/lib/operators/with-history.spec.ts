import { marbleTest } from 's-ng-dev-utils';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { withHistory } from './with-history';

describe('withHistory()', () => {
  it(
    'emits the last `historyCount` values',
    marbleTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1-2-3-4-|');
      const subs = '       ^--------!';
      const expected = '   -a-b-c-d-|';

      expectObservable(source.pipe(withHistory(2))).toBe(expected, {
        a: ['1'],
        b: ['2', '1'],
        c: ['3', '2', '1'],
        d: ['4', '3', '2'],
      });
      expectObservable(source.pipe(withHistory(1))).toBe(expected, {
        a: ['1'],
        b: ['2', '1'],
        c: ['3', '2'],
        d: ['4', '3'],
      });
      expectObservable(source.pipe(withHistory(0))).toBe(expected, {
        a: ['1'],
        b: ['2'],
        c: ['3'],
        d: ['4'],
      });
      expectSubscriptions(source.subscriptions).toBe([subs, subs, subs]);
    }),
  );

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() => withHistory(1)),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => withHistory(1)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => withHistory(1)),
  );
});
