import { noop } from '@s-libs/micro-dash';
import { marbleTest } from '@s-libs/ng-dev';
import { OperatorFunction, Subject } from 'rxjs';
import {
  expectPipeResult,
  subscribeWithStubs,
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../test-helpers/misc-helpers';
import { createOperatorFunction } from './create-operator-function';

/**
 * This is the example from the documentation. Keep it in sync.
 */
function map<I, O>(fn: (input: I) => O): OperatorFunction<I, O> {
  return createOperatorFunction<I, O>((subscriber, destination) => {
    subscriber.next = (value): void => {
      destination.next(fn(value));
    };
  });
}

function nonOp(): OperatorFunction<any, undefined> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return createOperatorFunction(() => {});
}

describe('createOperatorFunction()', () => {
  it('allows modifying values and errors', () => {
    const source = new Subject<number>();
    const sub = subscribeWithStubs(
      source.pipe(
        createOperatorFunction<number>((subscriber, destination) => {
          subscriber.next = (value): void => {
            destination.next(value + 1);
          };
          subscriber.error = (value): void => {
            destination.error(value - 1);
          };
        }),
      ),
    );

    source.next(10);
    sub.expectReceivedOnlyValue(11);

    source.error(10);
    sub.expectReceivedOnlyError(9);
  });

  it(
    'allows preventing values, error and completion',
    marbleTest(({ hot, expectObservable }) => {
      const operatorFunction = createOperatorFunction<string>((subscriber) => {
        subscriber.next = noop;
        subscriber.error = noop;
        subscriber.complete = noop;
      });

      const source1 = hot('-a-|').pipe(operatorFunction);
      const source2 = hot('-#  ').pipe(operatorFunction);
      const expected = '   ----';

      expectObservable(source1).toBe(expected);
      expectObservable(source2).toBe(expected);
    }),
  );

  it('works for the example in the documentation', async () => {
    await expectPipeResult(
      [1, 2, 3],
      map((i) => i + 1),
      [2, 3, 4],
    );
    await expectPipeResult(
      [1, 2, 3],
      map((i) => i.toString()),
      ['1', '2', '3'],
    );
  });

  it('passes along values by default', async () => {
    await expectPipeResult([1, 2, 3], nonOp(), [1, 2, 3]);
  });

  it('passes along unsubscribes by default', testUnsubscribePropagation(nonOp));

  it('passes along errors by default', testErrorPropagation(nonOp));

  it('passes along completion by default', testCompletionPropagation(nonOp));
});
