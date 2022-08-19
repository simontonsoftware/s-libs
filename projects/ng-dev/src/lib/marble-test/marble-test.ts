import { TestScheduler } from 'rxjs/testing';

// including this file in a build caused an error without this
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

type Run = Parameters<TestScheduler['run']>[0];
type Helpers = Parameters<Run>[0];
type Callback<T> = (
  testHelpers: Helpers & { testScheduler: TestScheduler },
) => T;

/**
 * A helper to take some boilerplate out of RxJS's {@link https://rxjs-dev.firebaseapp.com/guide/testing/marble-testing marble testing} API.
 *
 * ```ts
 * it("doubles numbers", marbleTest(({ cold, expectObservable }) => {
 *   const source = cold("-1-2-3-|");
 *   const expected = "   -2-4-6-|");
 *   expectObservable(source.pipe(double())).toBe(expected);
 * }));
 * ```
 */
export function marbleTest<T>(callback: Callback<T>): () => T {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
  return (): T =>
    testScheduler.run((helpers) => callback({ ...helpers, testScheduler }));
}
