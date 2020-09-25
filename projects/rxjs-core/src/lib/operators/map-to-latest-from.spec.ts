import { NEVER } from 'rxjs';
import { marbleTest } from 's-ng-dev-utils';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { mapToLatestFrom } from './map-to-latest-from';

describe('mapToLatestFrom()', () => {
  it(
    'emits the latest value from the given observable',
    marbleTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1---2--3------4-|');
      const inner = cold(' ---a------b--c----');
      const subs = '       ^----------------!';
      const expected = '   -----a--a------c-|';

      expectObservable(source.pipe(mapToLatestFrom(inner))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(inner.subscriptions).toBe(subs);
    }),
  );

  it(
    'handles errors from the inner observable',
    marbleTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-|');
      const inner = cold(' -#---');
      const subs = '       ^!---';
      const expected = '   -#---';

      expectObservable(source.pipe(mapToLatestFrom(inner))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(inner.subscriptions).toBe(subs);
    }),
  );

  it(
    'handles completion of the inner observable',
    marbleTest(({ cold, expectObservable }) => {
      const source = cold('--1-2-|');
      const inner = cold(' -a-|   ');
      const expected = '   --a-a-|';

      expectObservable(source.pipe(mapToLatestFrom(inner))).toBe(expected);
    }),
  );

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() => mapToLatestFrom(NEVER)),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => mapToLatestFrom(NEVER)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => mapToLatestFrom(NEVER)),
  );
});
