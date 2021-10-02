import { TestRequest } from '@angular/common/http/testing';
import { AngularContext } from '../angular-context';
import { HttpBody } from './expect-request';

/**
 * A class very similar to Angular's [TestRequest]{@linkcode https://angular.io/api/common/http/testing/TestRequest} for use with an {@linkcode AngularContext}. If you are using an `AngularContext`, this will trigger change detection automatically after you flush a response, like production behavior.
 *
 * Though it is possible to construct yourself, normally an instance of this class is obtained from {@linkcode expectRequest()}.
 *
 * ```ts
 * const ctx = new AngularContext();
 * ctx.run(() => {
 *   ctx
 *     .inject(HttpClient)
 *     .get('http://example.com', { params: { key: 'value' } })
 *     .subscribe();
 *   const request = expectRequest<string>('GET', 'http://example.com', {
 *     params: { key: 'value' },
 *   });
 *   request.flush('my response body');
 * });
 * ```
 */
export class SlTestRequest<Body extends HttpBody> {
  /**
   * The underlying [TestRequest]{@linkcode https://angular.io/api/common/http/testing/TestRequest} object from Angular.
   */
  request = this.req.request;

  constructor(private req: TestRequest) {}

  /**
   * Resolve the request with the given body and options, like [TestRequest.flush()]{@linkcode https://angular.io/api/common/http/testing/TestRequest#flush}.
   */
  flush(body: Body, opts?: Parameters<TestRequest['flush']>[1]): void {
    this.req.flush(body, opts);
    this.tickIfPossible();
  }

  /**
   * Convenience method to flush an error response.
   */
  flushError(
    status = 500,
    { statusText = 'simulated test error', body = null as HttpBody } = {},
  ): void {
    this.req.flush(body, { status, statusText });
    this.tickIfPossible();
  }

  /**
   * Returns whether the request has been cancelled.
   */
  isCancelled(): boolean {
    return this.req.cancelled;
  }

  private tickIfPossible(): void {
    AngularContext.getCurrent()?.tick();
  }
}
