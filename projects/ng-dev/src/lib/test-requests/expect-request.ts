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
interface AngularHttpMap {
  keys(): string[];
  get(key: string): string | null;
}

let matchCount: number;
let pendingRequests: HttpRequest<any>[];

/**
 * This convenience method is similar to [HttpTestingController.expectOne()]{@linkcode https://angular.io/api/common/http/testing/HttpTestingController}, with extra features. The returned request object will automatically trigger change detection when you flush a response, just like in production.
 *
 * This method is opinionated in that you must specify all aspects of the request to match. E.g. if the request specifies headers, you must also specify them in the arguments to this method.
 *
 * This method only works when you are using an {@linkcode AngularContext}.
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
export function expectRequest<ResponseBody extends HttpBody>(
  method: HttpMethod,
  url: string,
  options: RequestOptions & { body?: HttpBody } = {},
): SlTestRequest<ResponseBody> {
  expect().nothing(); // convince jasmine we are expecting something
  const opts = { params: {}, headers: {}, body: null, ...options };
  console.log({ options, opts });

  const ctx = AngularContext.getCurrent();
  assert(ctx, 'expectRequest only works while an AngularContext is in use');

  try {
    return matchRequest(ctx, method, url, opts);
  } catch (error) {
    console.error(
      'Expected 1 request to match:',
      { method, url, ...opts },
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
  method: 'DELETE' | 'GET' | 'POST' | 'PUT',
  url: string,
  opts: Required<RequestOptions> & { body: HttpBody },
) {
  const controller = ctx.inject(HttpTestingController);
  matchCount = 0;
  pendingRequests = [];
  return new SlTestRequest(
    controller.expectOne((req) => {
      pendingRequests.push(req);
      const found = isMatch(req, method, url, opts);
      if (found) {
        ++matchCount;
      }
      return found;
    }),
  );
}

function isMatch(
  req: HttpRequest<any>,
  method: HttpMethod,
  url: string,
  options: Required<RequestOptions> & { body: HttpBody },
): boolean {
  return (
    req.method === method &&
    req.url === url &&
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
