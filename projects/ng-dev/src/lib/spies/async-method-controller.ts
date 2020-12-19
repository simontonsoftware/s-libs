import { Deferred } from '@s-libs/js-core';
import { isEqual, nth, pull } from '@s-libs/micro-dash';
import { AngularContext } from '../test-context';
import { TestCall } from './test-call';

type AsyncFunc = (...args: any[]) => Promise<any>;

type Match<
  WrappingObject,
  FunctionName extends AsyncMethodKeys<WrappingObject>
> =
  | Parameters<WrappingObject[FunctionName]>
  | ((callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) => boolean);

type AsyncMethodKeys<T> = {
  [k in keyof T]: T[k] extends AsyncFunc ? k : never;
}[keyof T];

export class AsyncMethodController<
  WrappingObject,
  FunctionName extends AsyncMethodKeys<WrappingObject>
> {
  #spy: jasmine.Spy<WrappingObject[FunctionName]>;
  #testCalls: TestCall<WrappingObject[FunctionName]>[] = [];

  /**
   * @param context TODO: suggest users pass this in if the function they are stubbing can be found in https://github.com/angular/angular/blob/master/packages/zone.js/STANDARD-APIS.md
   */
  constructor(
    obj: WrappingObject,
    methodName: FunctionName,
    { context = undefined as AngularContext | undefined } = {},
  ) {
    // Note: it wasn't immediately clear how avoid `any` in this constructor, and this will be invisible to users. So I gave up. (For now.)
    this.#spy = spyOn(obj, methodName as any) as any;
    this.#spy.and.callFake((() => {
      const deferred = new Deferred<any>();
      this.#testCalls.push(new TestCall(deferred, context));
      return deferred.promise;
    }) as any);
  }

  expectOne(
    match: Match<WrappingObject, FunctionName>,
    description?: string,
  ): TestCall<WrappingObject[FunctionName]> {
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
    return matches[0];
  }

  expectNone(
    match: Match<WrappingObject, FunctionName>,
    description?: string,
  ): void {
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

  match(
    match: Match<WrappingObject, FunctionName>,
  ): TestCall<WrappingObject[FunctionName]>[] {
    this.ensureCallInfoIsSet();
    const filterFn = Array.isArray(match)
      ? this.makeArgumentMatcher(match)
      : match;
    return remove(this.#testCalls, (testCall) => filterFn(testCall.callInfo));
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

  private makeArgumentMatcher(
    args: Parameters<WrappingObject[FunctionName]>,
  ): (callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) => boolean {
    return (callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) =>
      isEqual(callInfo.args, args);
  }

  private buildErrorMessage(
    {
      stringifiedUserInput,
      matchType,
      matches,
    }: {
      stringifiedUserInput?: string;
      matchType: string;
      matches: TestCall<WrappingObject[FunctionName]>[];
    },
  ): string {
    let message = `Expected ${matchType} call(s)`;
    if (stringifiedUserInput) {
      message += ` for criterion "${stringifiedUserInput}"`;
    }
    message += `, found ${matches.length}`;
    return message;
  }

  private stringifyUserInput(
    match: Match<WrappingObject, FunctionName>,
    description?: string,
  ): string {
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
