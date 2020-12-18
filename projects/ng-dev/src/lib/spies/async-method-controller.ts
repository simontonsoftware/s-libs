import { Deferred } from '@s-libs/js-core';
import { isEqual, nth, pull } from '@s-libs/micro-dash';
import { AngularContext } from '../test-context';
import { TestCall } from './test-call';

type AsyncFunc = (...args: any[]) => Promise<any>;

type Match =
  // TODO: make this typing better (instead of using any)
  any[] | ((callInfo: jasmine.CallInfo<(...args: any[]) => any>) => boolean);

// TODO: put some effort into the DX to infer T
export class AsyncMethodController<
  N extends PropertyKey,
  O extends { [k in N]: AsyncFunc }
> {
  #spy: jasmine.Spy<O[N]>;
  #testCalls: TestCall[] = [];

  /**
   * @param context TODO: suggest users pass this in if the function they are stubbing can be found in https://github.com/angular/angular/blob/master/packages/zone.js/STANDARD-APIS.md
   */
  constructor(
    obj: O,
    methodName: N,
    { context = undefined as AngularContext | undefined } = {},
  ) {
    this.#spy = spyOn(obj, methodName as any) as any;
    this.#spy.and.callFake((() => {
      const deferred = new Deferred();
      this.#testCalls.push(new TestCall(deferred, context));
      return deferred.promise;
    }) as any); // TODO: make this typing better (instead of using any)
  }

  expectOne(match: Match, description?: string): TestCall {
    const matches = this.match(match);
    if (matches.length !== 1) {
      throw new Error(
        this.buildErrorMessage({
          matchType: 'one matching',
          matches,
          stringifiedUserInput: this.stringifyUserInput(match, description),
        }),
      );
    }

    const testCall = matches[0];
    pull(this.#testCalls, testCall);
    return testCall;
  }

  expectNone(match: Match, description?: string): void {
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(
        this.buildErrorMessage({
          matchType: 'zero matching',
          matches,
          stringifiedUserInput: this.stringifyUserInput(match, description),
        }),
      );
    }
  }

  match(match: Match): TestCall[] {
    this.ensureCallInfoIsSet();
    const filterFn = Array.isArray(match)
      ? this.makeArgumentMatcher(match)
      : match;
    return this.#testCalls.filter((testCall) => filterFn(testCall.callInfo));
  }

  verify(): void {
    if (this.#testCalls.length) {
      this.ensureCallInfoIsSet();
      let message =
        this.buildErrorMessage({
          matchType: 'no open',
          matches: this.#testCalls,
        }) + ':';
      for (const testCall of this.#testCalls) {
        message += `\n  ${stringifyArgs(testCall.callInfo.args)}`;
      }
      throw new Error(message);
    }
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
    {
      stringifiedUserInput,
      matchType,
      matches,
    }: {
      stringifiedUserInput?: string;
      matchType: string;
      matches: TestCall[];
    },
  ): string {
    let message = `Expected ${matchType} call(s)`;
    if (stringifiedUserInput) {
      message += ` for criterion "${stringifiedUserInput}"`;
    }
    message += `, found ${matches.length}`;
    return message;
  }

  private stringifyUserInput(match: Match, description?: string): string {
    if (!description) {
      if (Array.isArray(match)) {
        description = 'Match by arguments: ' + stringifyArgs(match);
      } else {
        description = 'Match by function: ' + match.name;
      }
    }
    return description;
  }
}

// TODO: when we have expectOne(), test that this works with mismatched arrays
function stringifyArgs(args: any[]): string {
  return JSON.stringify(args);
}
