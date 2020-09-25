import { Subject } from 'rxjs';
import {
  subscribeWithStubs,
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { distinctUntilKeysChanged } from './distinct-until-keys-changed';

describe('distinctUntilKeysChanged()', () => {
  it('only emits when the keys of the object change', () => {
    const source = new Subject<Record<string, number>>();
    const sub = subscribeWithStubs(source.pipe(distinctUntilKeysChanged()));

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

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() => distinctUntilKeysChanged()),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => distinctUntilKeysChanged()),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => distinctUntilKeysChanged()),
  );
});
