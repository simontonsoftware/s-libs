import { Deferred } from '@s-libs/js-core';
import { once } from '@s-libs/micro-dash';
import { AsyncTestCall } from './async-test-call';
import { CallTracker } from './call-tracker';

type AsyncFunc = (...args: any[]) => Promise<any>;

type AsyncMethodKeys<T> = keyof {
  [k in keyof T as T[k] extends AsyncFunc ? k : never]: 1;
};

type AsyncMethod<
  WrappingObject,
  FunctionName extends keyof WrappingObject,
> = WrappingObject[FunctionName] extends AsyncFunc
  ? WrappingObject[FunctionName]
  : never;

/**
 * Controller to be used in tests, that allows for mocking and flushing any asynchronous method. If you are using an {@linkcode AngularContext}, it automatically calls {@linkcode AngularContext#tick} after each `.flush()` and `.error()` to trigger promise handlers and change detection. This is the normal production behavior of asynchronous browser APIs.
 *
 * For example, to mock the browser's paste functionality:
 *
 * ```ts
 *  it('can paste', async () => {
 *   const { clipboard } = navigator;
 *   const ctx = new AngularContext();
 *
 *   // mock the browser API for pasting
 *   const controller = new AsyncMethodController(clipboard, 'readText');
 *   await ctx.run(async () => {
 *     // BEGIN production code that copies to the clipboard
 *     let pastedText: string;
 *     clipboard.readText().then((text) => {
 *       pastedText = text;
 *     });
 *     // END production code that copies to the clipboard
 *
 *     await controller.expectOne([]).flush('mock clipboard contents');
 *
 *     // BEGIN expect the correct results after a successful copy
 *     expect(pastedText!).toBe('mock clipboard contents');
 *     // END expect the correct results after a successful copy
 *   });
 * });
 * ```
 */
export class AsyncMethodController<
  WrappingObject extends object,
  MethodName extends AsyncMethodKeys<WrappingObject>,
> extends CallTracker<AsyncTestCall<AsyncMethod<WrappingObject, MethodName>>> {
  constructor(obj: WrappingObject, methodName: MethodName) {
    const mock: any = vi.spyOn(obj, methodName);
    super(
      once((track) => {
        mock.mockImplementation(async () => {
          const deferred = new Deferred();
          track(new AsyncTestCall(mock, mock.mock.calls.length - 1, deferred));
          return deferred.promise;
        });
      }),
    );
  }
}
