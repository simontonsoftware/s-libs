import { expectSingleCallAndReset, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { wrapMethod } from './wrap-method';

describe('wrapMethod()', () => {
  it('replaces the method with a wrapped function', () => {
    const toReturn = Symbol('toReturn');
    const method = jasmine.createSpy().and.returnValue(toReturn);
    const object = { method };
    const before = jasmine.createSpy();
    const arg1 = Symbol('arg1');
    const arg2 = Symbol('arg2');

    wrapMethod(object, 'method', { before });
    const returned = object.method(arg1, arg2);

    expect(returned).toBe(toReturn);
    expect(before.calls.first().object).toBe(object);
    expectSingleCallAndReset(before, arg1, arg2);
    expect(method.calls.first().object).toBe(object);
    expectSingleCallAndReset(method, arg1, arg2);
  });

  it('returns a function to reset', () => {
    const method = jasmine.createSpy();
    const before = jasmine.createSpy();
    const object = { method };
    const unwrap = wrapMethod(object, 'method', { before });

    object.method();
    expectSingleCallAndReset(before);
    expectSingleCallAndReset(method);

    unwrap();
    object.method();
    expect(before).not.toHaveBeenCalled();
    expectSingleCallAndReset(method);
  });

  it('works for the HttpClient example in the docs', () => {
    const httpGet = jasmine.createSpy();
    const consoleLog = spyOn(console, 'log');
    class HttpClient {
      get(url: string): void {
        httpGet(url);
      }
    }

    wrapMethod(HttpClient.prototype, 'get', {
      before(url): void {
        console.log('Sending GET request to', url);
      },
    });

    new HttpClient().get('url1');
    expectSingleCallAndReset(httpGet, 'url1');
    expectSingleCallAndReset(consoleLog, 'Sending GET request to', 'url1');

    new HttpClient().get('url2');
    expectSingleCallAndReset(httpGet, 'url2');
    expectSingleCallAndReset(consoleLog, 'Sending GET request to', 'url2');
  });

  it('works for the console.error example in the docs', () => {
    const consoleError = spyOn(console, 'error');
    const unwrap = wrapMethod(console, 'error', {
      around(original, ...args): void {
        if (args[0].message !== 'something benign') {
          original(...args);
        }
      },
    });

    console.error('blah');
    console.error(new Error('something benign'));

    expectSingleCallAndReset(consoleError, 'blah');
    unwrap();
  });

  it('has fancy typing', () => {
    staticTest(() => {
      expectTypeOf(
        wrapMethod({ method(): void {} }, 'method', {}),
      ).toEqualTypeOf<() => void>();
      // @ts-expect-error
      wrapMethod({ method(): void {} }, 'notTheMethod', {});
      expectTypeOf(
        wrapMethod({ method(_arg: string): void {} }, 'method', {
          before(_arg: string): void {},
        }),
      ).toEqualTypeOf<() => void>();
      wrapMethod({ method(_arg: string): void {} }, 'method', {
        // @ts-expect-error arg should be string
        before(_arg: number): void {},
      });

      // Production bug: this was showing an error because the typing thought it was trying to wrap the wrong method
      class EventTrackingService {
        sendError(_message: string): void {}
        track(_name: string, _category: string): void {}
      }
      expectTypeOf(
        wrapMethod(new EventTrackingService(), 'track', {
          before(_name: string, _category: string): void {},
        }),
      ).toEqualTypeOf<() => void>();
    });
  });
});
