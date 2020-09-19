import { expectSingleCallAndReset } from 's-ng-dev-utils';
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
});
