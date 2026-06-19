import {
  HttpClient,
  HttpRequest,
  provideHttpClient,
} from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { expectTypeOf } from 'expect-type';
import { AngularContext } from '../angular-context';
import { expectSingleCallAndReset } from '../mocks/expect-single-call-and-reset';
import { expectRequest, HttpBody } from './expect-request';
import { SlTestRequest } from './sl-test-request';

describe('expectRequest()', () => {
  let ctx: AngularContext;
  let http: HttpClient;
  beforeEach(() => {
    ctx = new AngularContext({ providers: [provideHttpClient()] });
    http = ctx.inject(HttpClient);
  });

  function cleanUpPendingRequests(): void {
    ctx.inject(HttpTestingController).match(() => true);
  }

  it('allows optionally declaring the response body type', async () => {
    await ctx.run(() => {
      http.get('url 1').subscribe();
      http.get('url 2').subscribe();

      expectTypeOf(expectRequest<{ a: 1 }>('GET', 'url 1')).toEqualTypeOf<
        SlTestRequest<{ a: 1 }>
      >();
      expectTypeOf(expectRequest('GET', 'url 2')).toEqualTypeOf<
        SlTestRequest<HttpBody>
      >();
    });
  });

  it('returns a matching SlTestRequest', async () => {
    await ctx.run(() => {
      const method = 'GET';
      const url = 'a url';
      const request = new HttpRequest(method, url);
      http.request(request).subscribe();

      const req = expectRequest(method, url);

      expect(req.request).toBe(request);
    });
  });

  it('matches on method, url, params, headers and body', async () => {
    await ctx.run(async () => {
      const method = 'PUT';
      const url = 'correct_url';
      const body = 'correct_body';
      const options = {
        body,
        headers: { header: 'correct' },
        params: { param: 'correct' },
      };
      http.put(url, body, options).subscribe();

      expect(() => {
        expectRequest('DELETE', url, options);
      }).toThrow();
      expect(() => {
        expectRequest(method, 'wrong', options);
      }).toThrow();
      expect(() => {
        expectRequest(method, url, {
          ...options,
          params: { param: 'wrong' },
        });
      }).toThrow();
      expect(() => {
        expectRequest(method, url, {
          ...options,
          headers: { header: 'wrong' },
        });
      }).toThrow();
      expect(() => {
        expectRequest(method, url, { ...options, body: 'wrong' });
      }).toThrow();
      expect(() => {
        expectRequest(method, url, options);
      }).not.toThrow();
    });
  });

  it('has nice defaults', async () => {
    await ctx.run(async () => {
      const method = 'GET';
      const url = 'correct_url';
      http.get(url).subscribe();

      expect(() => {
        expectRequest(method, url, { params: { default: 'false' } });
      }).toThrow();
      expect(() => {
        expectRequest(method, url, { headers: { default: 'false' } });
      }).toThrow();
      expect(() => {
        expectRequest(method, url, { body: 'not_default' });
      }).toThrow();
      expect(() => {
        expectRequest(method, url);
      }).not.toThrow();
    });
  });

  it('throws a friendly message when there are no/multiple matches', async () => {
    await ctx.run(async () => {
      http.get('right').subscribe();
      http.get('right').subscribe();

      expect(() => {
        expectRequest('GET', 'wrong');
      }).toThrow(
        `Expected 1 matching request, found 0. See details logged to the console.`,
      );
      expect(() => {
        expectRequest('GET', 'right');
      }).toThrow(
        `Expected 1 matching request, found 2. See details logged to the console.`,
      );

      cleanUpPendingRequests();
    });
  });

  it('logs helpful details when there are no matches', async () => {
    const log = vi.spyOn(console, 'error');
    await ctx.run(async () => {
      const request1 = new HttpRequest('GET', 'url 1');
      const request2 = new HttpRequest('DELETE', 'url 2');
      http.request(request1).subscribe();
      http.request(request2).subscribe();

      expect(() => {
        expectRequest('GET', 'bad url');
      }).toThrow();
      expectSingleCallAndReset(
        log,
        'Expected 1 request to match:',
        { method: 'GET', url: 'bad url', params: {}, headers: {}, body: null },
        'Actual pending requests:',
        [request1, request2],
      );

      cleanUpPendingRequests();
    });
  });
});

describe('expectRequest() outside an AngularContext', () => {
  it('throws a meaningful error', () => {
    expect(() => {
      expectRequest('GET', 'a url');
    }).toThrow('expectRequest only works while an AngularContext is in use');
  });
});

describe('expectRequest() example in the docs', () => {
  it('works', async () => {
    const ctx = new AngularContext({ providers: [provideHttpClient()] });
    await ctx.run(async () => {
      ctx
        .inject(HttpClient)
        .get('http://example.com', { params: { key: 'value' } })
        .subscribe();
      const request = expectRequest<string>('GET', 'http://example.com', {
        params: { key: 'value' },
      });
      await request.flush('my response body');
    });
  });
});
