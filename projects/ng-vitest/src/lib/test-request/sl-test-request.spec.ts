import {
  HttpClient,
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import { TestRequest } from '@angular/common/http/testing';
import { noop } from '@s-libs/micro-dash';
import { Subject } from 'rxjs';
import { AngularContext } from '../angular-context';
import { expectSingleCallAndReset } from '../mocks/expect-single-call-and-reset';
import { expectRequest } from './expect-request';
import { SlTestRequest } from './sl-test-request';

describe('SlTestRequest', () => {
  type ErrorFn = (error: any) => void;

  describe('.request', () => {
    it('is available', () => {
      const httpRequest = new HttpRequest('GET', 'url');
      const req = new SlTestRequest(
        new TestRequest(httpRequest, new Subject()),
      );
      expect(req.request).toBe(httpRequest);
    });
  });

  describe('.flush()', () => {
    it('resolves the request with the given body and options', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await ctx.run(async () => {
        const mock = vi.fn<(value: unknown) => void>();
        ctx.inject(HttpClient).get('a url').subscribe(mock);
        const req = expectRequest('GET', 'a url');

        const body = 'the body';
        await req.flush(body);

        expectSingleCallAndReset(mock, body);
      });
    });

    it('passes along other arguments', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await ctx.run(async () => {
        const mock = vi.fn<(value: HttpResponse<unknown>) => void>();
        ctx
          .inject(HttpClient)
          .request('GET', 'a url', { observe: 'response' })
          .subscribe(mock);
        const req = expectRequest('GET', 'a url');

        await req.flush('', { status: 249, statusText: '' });
        const resp = mock.mock.calls[0][0];
        expect(resp.status).toBe(249);
      });
    });

    it('runs tick if an AngularContext is in use', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      const spy = vi.spyOn(ctx, 'tick');
      await ctx.run(async () => {
        ctx.inject(HttpClient).get('a url').subscribe();
        const req = expectRequest('GET', 'a url');

        await req.flush('the body');

        expectSingleCallAndReset(spy);
      });
    });
  });

  describe('.flushError()', () => {
    it('rejects the request with the given args', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await ctx.run(async () => {
        const mock = vi.fn<ErrorFn>();
        ctx.inject(HttpClient).get('a url').subscribe({ error: mock });
        const req = expectRequest('GET', 'a url');

        await req.flushError(123, { statusText: 'bad', body: 'stop it' });

        const resp: HttpErrorResponse = mock.mock.calls[0][0];
        expect(resp.status).toBe(123);
        // eslint-disable-next-line  @typescript-eslint/no-deprecated
        expect(resp.statusText).toBe('bad');
        expect(resp.error).toBe('stop it');
      });
    });

    it('has good default args', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await ctx.run(async () => {
        const mock = vi.fn<ErrorFn>();
        ctx.inject(HttpClient).get('a url').subscribe({ error: mock });
        const req = expectRequest('GET', 'a url');

        await req.flushError();

        const resp: HttpErrorResponse = mock.mock.calls[0][0];
        expect(resp.status).toBe(500);
        // eslint-disable-next-line  @typescript-eslint/no-deprecated
        expect(resp.statusText).toBe('simulated test error');
        expect(resp.error).toBeNull();
      });
    });

    it('runs tick if an AngularContext is in use', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      const spy = vi.spyOn(ctx, 'tick');
      await ctx.run(async () => {
        ctx.inject(HttpClient).get('a url').subscribe({ error: noop });
        const req = expectRequest('GET', 'a url');

        await req.flushError();

        expectSingleCallAndReset(spy);
      });
    });
  });

  describe('.isCancelled()', () => {
    it('returns whether the request has been cancelled', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await ctx.run(() => {
        const subscription = ctx.inject(HttpClient).get('a url').subscribe();
        const req = expectRequest('GET', 'a url');

        expect(req.isCancelled()).toBe(false);
        subscription.unsubscribe();
        expect(req.isCancelled()).toBe(true);
      });
    });
  });

  describe('.tickIfPossible()', () => {
    it('gracefully handles when there is no AngularContext', async () => {
      const httpRequest = new HttpRequest('GET', 'url');
      const req = new SlTestRequest(
        new TestRequest(httpRequest, new Subject()),
      );
      await expect(req.flush('')).resolves.not.toThrow();
    });
  });

  it('works for the example in the docs', async () => {
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
