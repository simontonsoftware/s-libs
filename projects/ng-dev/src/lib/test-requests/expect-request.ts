import { HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { assert, mapAsKeys } from '@s-libs/js-core';
import { isEqual } from '@s-libs/micro-dash';
import { AngularContext } from '../angular-context';
import { SlTestRequest } from './sl-test-request';

export type HttpMethod = 'DELETE' | 'GET' | 'POST' | 'PUT';
export type HttpBody = Parameters<TestRequest['flush']>[0];
interface RequestOptions {
  params?: Record<string, string>;
  headers?: Record<string, string>;
}
type MatchOptions = Required<RequestOptions> & {
  method: HttpMethod;
  url: string;
  body: HttpBody;
};
interface AngularHttpMap {
  keys: () => string[];
  get: (key: string) => string | null;
}

let matchCount: number;
let pendingRequests: Array<HttpRequest<any>>;

/**
 * This convenience function is similar to {@linkcode https://angular.dev/api/common/http/testing/HttpTestingController | HttpTestingController.expectOne()}, with extra features. The returned request object will automatically trigger change detection when you flush a response, just like in production.
 *
 * This function is opinionated in that you must specify all aspects of the request to match. E.g. if the request specifies headers, you must also specify them in the arguments to this method.
 *
 * This function only works when you are using an {@linkcode AngularContext}.
 *
 * ```ts
 * const ctx = new AngularContext({ providers: [provideHttpClient()] });
 * ctx.run(() => {
 *   inject(HttpClient)
 *     .get('http://example.com', { params: { key: 'value' } })
 *     .subscribe();
 *   const request = expectRequest<string>('GET', 'http://example.com', {
 *     params: { key: 'value' },
 *   });
 *   request.flush('my response body');
 * });
 * ```
 */
export function expectRequest<ResponseBody extends HttpBody>(
  method: HttpMethod,
  url: string,
  options: RequestOptions & { body?: HttpBody } = {},
): SlTestRequest<ResponseBody> {
  expect().nothing(); // convince jasmine we are expecting something
  const ctx = AngularContext.getCurrent();
  assert(ctx, 'expectRequest only works while an AngularContext is in use');

  const opts = { method, url, params: {}, headers: {}, body: null, ...options };
  try {
    return matchRequest(ctx, opts);
  } catch (error) {
    console.error(
      'Expected 1 request to match:',
      opts,
      'Actual pending requests:',
      pendingRequests,
    );
    throw new Error(
      `Expected 1 matching request, found ${matchCount}. See details logged to the console.`,
    );
  }
}

function matchRequest(
  ctx: AngularContext,
  options: MatchOptions,
): SlTestRequest<HttpBody> {
  const controller = ctx.inject(HttpTestingController);
  matchCount = 0;
  pendingRequests = [];
  return new SlTestRequest(
    controller.expectOne((req) => {
      pendingRequests.push(req);
      const found = isMatch(req, options);
      if (found) {
        ++matchCount;
      }
      return found;
    }),
  );
}

function isMatch(req: HttpRequest<any>, options: MatchOptions): boolean {
  return (
    req.method === options.method &&
    req.url === options.url &&
    matchAngularHttpMap(req.params, options.params) &&
    matchAngularHttpMap(req.headers, options.headers) &&
    isEqual(req.body, options.body)
  );
}

function matchAngularHttpMap(
  actual: AngularHttpMap,
  expected: Record<string, string>,
): boolean {
  const actualObj = mapAsKeys(actual.keys(), (key) => actual.get(key));
  return isEqual(actualObj, expected);
}
