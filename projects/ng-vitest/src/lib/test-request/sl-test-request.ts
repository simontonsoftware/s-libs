import { HttpRequest } from '@angular/common/http';
import { TestRequest } from '@angular/common/http/testing';
import { AngularContext } from '../angular-context';
import { HttpBody } from './expect-request';

/**
 * A class very similar to Angular's {@linkcode https://angular.dev/api/common/http/testing/TestRequest | TestRequest} for use with an {@linkcode AngularContext}. If you are using an `AngularContext`, this will trigger change detection automatically after you flush a response, like production behavior.
 *
 * Though it is possible to construct yourself, normally an instance of this class is obtained from {@linkcode expectRequest()}.
 *
 * ```ts
 * const ctx = new AngularContext({ providers: [provideHttpClient()] });
 * await ctx.run(async () => {
 *   ctx
 *     .inject(HttpClient)
 *     .get('http://example.com', { params: { key: 'value' } })
 *     .subscribe();
 *   const request = expectRequest<string>('GET', 'http://example.com', {
 *     params: { key: 'value' },
 *   });
 *   await request.flush('my response body');
 * });
 * ```
 */
export class SlTestRequest<Body extends HttpBody> {
  /**
   * The underlying {@linkcode https://angular.dev/api/common/http/testing/TestRequest | TestRequest} object from Angular.
   */
  request: HttpRequest<any>;

  constructor(private req: TestRequest) {
    this.request = this.req.request;
  }

  /**
   * Resolve the request with the given body and options, like {@linkcode https://angular.dev/api/common/http/testing/TestRequest#flush | TestRequest.flush()}.
   */
  async flush(
    body: Body,
    opts?: Parameters<TestRequest['flush']>[1],
  ): Promise<void> {
    this.req.flush(body, opts);
    await this.#tickIfPossible();
  }

  /**
   * Convenience method to flush an error response.
   */
  async flushError(
    status = 500,
    {
      statusText = 'simulated test error',
      body = null,
    }: { statusText?: string; body?: HttpBody } = {},
  ): Promise<void> {
    this.req.flush(body, { status, statusText });
    await this.#tickIfPossible();
  }

  /**
   * Returns whether the request has been cancelled.
   */
  isCancelled(): boolean {
    return this.req.cancelled;
  }

  async #tickIfPossible(): Promise<void> {
    await AngularContext.getCurrent()?.tick();
  }
}
