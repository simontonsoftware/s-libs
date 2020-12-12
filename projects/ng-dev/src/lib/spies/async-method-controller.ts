import { Deferred } from '@s-libs/js-core';
import { nth } from '../../to-replace/micro-dash/nth';
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

  // TODO: match the type of the method for CallInfo
  match(
    match: (callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean,
  ): TestCall[] {
    this.ensureCallInfoIsSet();
    return this.#testCalls.filter((testCall) => match(testCall.callInfo));
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
}
