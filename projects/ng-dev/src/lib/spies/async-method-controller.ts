import { Deferred } from '@s-libs/js-core';
import { isEqual, nth, remove } from '@s-libs/micro-dash';
import { buildErrorMessage } from '../utils';
import { TestCall } from './test-call';

type AsyncFunc = (...args: any[]) => Promise<any>;

type Match<
  WrappingObject,
  FunctionName extends AsyncMethodKeys<WrappingObject>,
> =
  | Parameters<WrappingObject[FunctionName]>
  | ((callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) => boolean);

type AsyncMethodKeys<T> = {
  [k in keyof T]: T[k] extends AsyncFunc ? k : never;
}[keyof T];

/**
 * Controller to be used in tests, that allows for mocking and flushing any asynchronous function. For example, to mock the browser's paste functionality:
 *
 * ```ts
 *  it('can paste', () => {
 *   const clipboard = navigator.clipboard;
 *   const ctx = new AngularContext();
 *
 *   // mock the browser API for pasting
 *   const controller = new AsyncMethodController(clipboard, 'readText');
 *   ctx.run(() => {
 *     // BEGIN production code that copies to the clipboard
 *     let pastedText: string;
 *     clipboard.readText().then((text) => {
 *       pastedText = text;
 *     });
 *     // END production code that copies to the clipboard
 *
 *     // mock the behavior when the user denies access to the clipboard
 *     controller.expectOne([]).flush('mock clipboard contents');
 *
 *     // BEGIN expect the correct results after a successful copy
 *     expect(pastedText!).toBe('mock clipboard contents');
 *     // END expect the correct results after a successful copy
 *   });
 * });
 * ```
 */
export class AsyncMethodController<
  WrappingObject,
  FunctionName extends AsyncMethodKeys<WrappingObject>,
> {
  #spy: jasmine.Spy<WrappingObject[FunctionName]>;
  #testCalls: TestCall<WrappingObject[FunctionName]>[] = [];

  /**
   * If you are using an `AngularContext`, the default behavior is to automatically call `.tick()` after each `.flush()` and `.error()` to trigger promise handlers and changed detection. This is the normal production behavior of asynchronous browser APIs. However, if zone.js does not patch the function you are stubbing, change detection would not run automatically. In that case you many want to turn off this behavior by passing the option `autoTick: false`. See the list of functions that zone.js patches [here](https://github.com/angular/angular/blob/master/packages/zone.js/STANDARD-APIS.md).
   */
  constructor(
    obj: WrappingObject,
    methodName: FunctionName,
    { autoTick = true } = {},
  ) {
    // Note: it wasn't immediately clear how avoid `any` in this constructor, and this will be invisible to users. So I gave up. (For now?)
    this.#spy = spyOn(obj, methodName as any) as any;
    this.#spy.and.callFake((() => {
      const deferred = new Deferred<any>();
      this.#testCalls.push(new TestCall(deferred, autoTick));
      return deferred.promise;
    }) as any);
  }

  /**
   * Expect that a single call was made that matches the given parameters or predicate, and return its mock. If no such call was made, or more than one, fail with a message including `description`, if provided.
   */
  expectOne(
    match: Match<WrappingObject, FunctionName>,
    description?: string,
  ): TestCall<WrappingObject[FunctionName]> {
    const matches = this.match(match);
    if (matches.length !== 1) {
      throw new Error(
        buildErrorMessage({
          matchType: 'one matching',
          itemType: 'call',
          matches,
          stringifiedUserInput: this.#stringifyUserInput(match, description),
        }),
      );
    }
    return matches[0];
  }

  /**
   * Expect that no calls were made which match the given parameters or predicate. If a matching call was made, fail with a message including `description`, if provided.
   */
  expectNone(
    match: Match<WrappingObject, FunctionName>,
    description?: string,
  ): void {
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(
        buildErrorMessage({
          matchType: 'zero matching',
          itemType: 'call',
          stringifiedUserInput: this.#stringifyUserInput(match, description),
          matches,
        }),
      );
    }
  }

  /**
   * Search for calls that match the given parameters or predicate, without any expectations.
   */
  match(
    match: Match<WrappingObject, FunctionName>,
  ): TestCall<WrappingObject[FunctionName]>[] {
    this.#ensureCallInfoIsSet();
    const filterFn = Array.isArray(match)
      ? this.#makeArgumentMatcher(match)
      : match;
    return remove(this.#testCalls, (testCall) => filterFn(testCall.callInfo));
  }

  /**
   * Verify that no unmatched calls are outstanding. If any are, fail with a message indicating which calls were not matched.
   */
  verify(): void {
    if (this.#testCalls.length) {
      this.#ensureCallInfoIsSet();
      let message =
        buildErrorMessage({
          matchType: 'no open',
          itemType: 'call',
          stringifiedUserInput: undefined,
          matches: this.#testCalls,
        }) + ':';
      for (const testCall of this.#testCalls) {
        message += `\n  ${stringifyArgs(testCall.callInfo.args)}`;
      }
      throw new Error(message);
    }
  }

  #ensureCallInfoIsSet(): void {
    for (let i = 1; i <= this.#testCalls.length; ++i) {
      const testCall = nth(this.#testCalls, -i);
      if (testCall.callInfo) {
        return;
      }

      testCall.callInfo = nth(this.#spy.calls.all(), -i);
    }
  }

  #makeArgumentMatcher(
    args: Parameters<WrappingObject[FunctionName]>,
  ): (callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) => boolean {
    return (callInfo: jasmine.CallInfo<WrappingObject[FunctionName]>) =>
      isEqual(callInfo.args, args);
  }

  #stringifyUserInput(
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

function stringifyArgs(args: any[]): string {
  return JSON.stringify(args);
}
