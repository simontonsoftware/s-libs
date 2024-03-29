import { fakeAsync, tick } from '@angular/core/testing';
import { expectSingleCallAndReset, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { debounce } from './debounce';

describe('debounce()', () => {
  it('has good typing', () => {
    staticTest(() => {
      expectTypeOf(debounce((_s: string, _n: number) => 'hi')).toEqualTypeOf<
        ((_s: string, _n: number) => void) & { cancel: () => void }
      >();
    });
  });

  it('defaults `wait` to 0', fakeAsync(() => {
    const spy = jasmine.createSpy();
    const debounced = debounce(spy);

    debounced();
    expect(spy).not.toHaveBeenCalled();

    tick(0);
    expectSingleCallAndReset(spy);
  }));

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should debounce a function', fakeAsync(() => {
    const spy = jasmine.createSpy();
    const debounced = debounce(spy, 32);

    debounced();
    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();

    tick(128);
    expectSingleCallAndReset(spy);

    debounced();
    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();

    tick(256);
    expectSingleCallAndReset(spy);
  }));

  it('should not immediately call `func` when `wait` is `0`', fakeAsync(() => {
    const spy = jasmine.createSpy();
    const debounced = debounce(spy, 0);

    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();

    tick(5);
    expectSingleCallAndReset(spy);
  }));

  it('should invoke the call with the correct arguments', fakeAsync(() => {
    const object = {};
    const spy = jasmine.createSpy();
    const debounced = debounce(spy, 32);

    debounced.call(object, 'a');
    debounced.call(object, 'b', 3);
    tick(64);
    expectSingleCallAndReset(spy, 'b', 3);
  }));

  it('supports recursive calls', fakeAsync(() => {
    const queue = ['b', 'c'];
    const processed: string[] = [];
    const debounced = debounce((item: string) => {
      processed.push(item);

      const next = queue.shift();
      if (next) {
        debounced(next);
      }
    }, 32);

    debounced('a');

    tick(256);
    expect(processed).toEqual(['a', 'b', 'c']);
  }));

  it('should support cancelling delayed calls', fakeAsync(() => {
    const spy = jasmine.createSpy();
    const debounced = debounce(spy, 32);

    debounced();
    debounced.cancel();

    tick(64);
    expect(spy).not.toHaveBeenCalled();
  }));

  it('should noop `cancel` when nothing is queued', fakeAsync(() => {
    const spy = jasmine.createSpy();
    const debounced = debounce(spy, 32);

    debounced.cancel();

    tick(64);
    expect(spy).not.toHaveBeenCalled();
  }));
});
