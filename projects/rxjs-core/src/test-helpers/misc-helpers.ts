import { marbleTest } from '@s-libs/ng-dev';
import {
  BehaviorSubject,
  lastValueFrom,
  Observable,
  of,
  OperatorFunction,
} from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';
import { StubbedSubscriber } from './stubbed-subscriber';

export async function expectPipeResult<I, O>(
  source: I[],
  operator: OperatorFunction<I, O>,
  result: O[],
): Promise<void> {
  expect(await pipeAndCollect(source, operator)).toEqual(result);
}

export async function pipeAndCollect<I, O>(
  source: I[],
  operator: OperatorFunction<I, O>,
): Promise<O[]> {
  return lastValueFrom(of(...source).pipe(operator, toArray()));
}

export function testUserFunctionError(
  buildOperator: (thrower: () => never) => OperatorFunction<any, any>,
  upstreamValue: any,
): () => void {
  return marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
    const thrower = (): never => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal -- this is the error TestScheduler expects when it sees "#"
      throw 'error';
    };
    const source = hot('-1-', { 1: upstreamValue });
    const expect1 = '   -# ';
    const expect2 = '   -a-';
    const allSubs = '   ^! ';

    expectObservable(source.pipe(buildOperator(thrower))).toBe(expect1);
    expectObservable(source.pipe(buildOperator(thrower))).toBe(expect1);
    expectObservable(
      source.pipe(
        buildOperator(thrower),
        catchError(() => new BehaviorSubject('a')),
      ),
    ).toBe(expect2);
    expectSubscriptions(source.subscriptions).toBe([allSubs, allSubs, allSubs]);
  });
}

export function testUnsubscribePropagation(
  buildOperator: () => OperatorFunction<any, any>,
): () => void {
  return marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
    const source = hot('-');
    const sub1 = '-^---!  ';
    const sub2 = '---^---!';

    expectObservable(source.pipe(buildOperator()), sub1).toBe('-');
    expectObservable(source.pipe(buildOperator()), sub2).toBe('-');
    expectSubscriptions(source.subscriptions).toBe([sub1, sub2]);
  });
}

export function testValuePropagation(
  buildOperator: () => OperatorFunction<any, any>,
): () => Promise<void> {
  return async (): Promise<void> =>
    expectPipeResult([1, 'b'], buildOperator(), [1, 'b']);
}

export function testErrorPropagation(
  buildOperator: () => OperatorFunction<any, any>,
): () => void {
  return marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
    const source = hot('-#');
    const subs = '      ^!';
    const expected = '  -#';

    expectObservable(source.pipe(buildOperator())).toBe(expected);
    expectObservable(source.pipe(buildOperator())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe([subs, subs]);
  });
}

export function testCompletionPropagation(
  buildOperator: () => OperatorFunction<any, any>,
): () => void {
  return marbleTest(({ hot, expectObservable, expectSubscriptions }) => {
    const source = hot('----|');
    const sub1 = '      ^----';
    const sourceSub1 = '^---!';
    const sub2 = '      --^--';
    const sourceSub2 = '--^-!';
    const expected = '  ----|';

    expectObservable(source.pipe(buildOperator()), sub1).toBe(expected);
    expectObservable(source.pipe(buildOperator()), sub2).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe([sourceSub1, sourceSub2]);
  });
}

export function subscribeWithStubs(
  observable: Observable<any>,
): StubbedSubscriber {
  const subscriber = new StubbedSubscriber();
  observable.subscribe(subscriber);
  return subscriber;
}
