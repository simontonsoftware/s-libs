import { Deferred } from '@s-libs/js-core';
import { isEqual, nth, pull } from '@s-libs/micro-dash';
import { TestCall } from './test-call';

type AsyncFunc = (...args: any[]) => Promise<any>;

// TODO: put some effort into the DX to infer T
export class AsyncMethodController<
  N extends PropertyKey,
  O extends { [k in N]: AsyncFunc }
> {
  #spy: jasmine.Spy<O[N]>;
  #testCalls: TestCall[] = [];

  constructor(obj: O, methodName: N) {
    this.#spy = spyOn(obj, methodName as any) as any;
    this.#spy.and.callFake((() => {
      const deferred = new Deferred();
      this.#testCalls.push(new TestCall(deferred));
      return deferred.promise;
    }) as any); // TODO: make this typing better (instead of using any)
  }

  expectOne(
    // TODO: make this typing better (instead of using any)
    match:
      | any[]
      | ((callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean),
    description?: string,
  ): TestCall {
    const matches = this.match(match);
    if (matches.length !== 1) {
      throw new Error(
        this.buildErrorMessage(match, description, 'one', matches),
      );
    }

    const testCall = matches[0];
    pull(this.#testCalls, testCall);
    return testCall;
  }

  expectNone(
    // TODO: make this typing better (instead of using any)
    match:
      | any[]
      | ((callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean),
    description?: string,
  ): void {
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(
        this.buildErrorMessage(match, description, 'zero', matches),
      );
    }
  }

  match(
    // TODO: make this typing better (instead of using any)
    match:
      | any[]
      | ((callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean),
  ): TestCall[] {
    this.ensureCallInfoIsSet();
    const filterFn = Array.isArray(match)
      ? this.makeArgumentMatcher(match)
      : match;
    return this.#testCalls.filter((testCall) => filterFn(testCall.callInfo));
  }

  // TODO: when we have expectOne(), test that this works with mismatched arrays
  private ensureCallInfoIsSet(): void {
    for (let i = 1; i <= this.#testCalls.length; ++i) {
      const testCall = nth(this.#testCalls, -i);
      if (testCall.callInfo) {
        return;
      }

      testCall.callInfo = nth(this.#spy.calls.all(), -i);
    }
  }

  // TODO: make this typing better (instead of using any)
  private makeArgumentMatcher(
    args: any[],
  ): (callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean {
    return (callInfo: jasmine.CallInfo<(...args: any[]) => any>) =>
      isEqual(callInfo.args, args);
  }

  private buildErrorMessage(
    // TODO: make this typing better (instead of using any)
    match:
      | any[]
      | ((callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean),
    description: string | undefined,
    expectedMatchCount: string,
    matches: TestCall[],
  ): string {
    if (!description) {
      if (Array.isArray(match)) {
        description = 'Match by arguments: ' + JSON.stringify(match);
      } else {
        description = 'Match by function: ' + match.name;
      }
    }
    return `Expected ${expectedMatchCount} matching request(s) for criterion "${description}", found ${matches.length}`;
  }
}
