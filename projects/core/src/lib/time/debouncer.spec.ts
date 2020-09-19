import { fakeAsync, tick } from '@angular/core/testing';
import { expectSingleCallAndReset } from 's-ng-dev-utils';
import { Debouncer } from './debouncer';

describe('Debouncer', () => {
  let debouncer: Debouncer;
  let spy: jasmine.Spy;

  beforeEach(() => {
    debouncer = new Debouncer();
    spy = jasmine.createSpy();
  });

  it('defaults `wait` to 0', fakeAsync(() => {
    debouncer.run(spy);
    expect(spy).not.toHaveBeenCalled();

    tick(0);
    expectSingleCallAndReset(spy);
  }));

  it('can set a different timeout on each run', fakeAsync(() => {
    debouncer.run(spy, 1000, 1);
    tick(500);
    debouncer.run(spy, 0, 2);
    debouncer.run(spy, 1000, 3);
    tick(500);
    debouncer.run(spy, 2000, 4);
    debouncer.run(spy, 50, 5);
    tick(50);
    expectSingleCallAndReset(spy, 5);
  }));

  it('can use a different function on each run', fakeAsync(() => {
    const spy2 = jasmine.createSpy();

    debouncer.run(spy, 10);
    debouncer.run(spy2, 10);
    tick(10);
    expect(spy).not.toHaveBeenCalled();
    expectSingleCallAndReset(spy2);

    debouncer.run(spy);
    tick(0);
    expectSingleCallAndReset(spy);
    expect(spy2).not.toHaveBeenCalled();
  }));

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should debounce a function', fakeAsync(() => {
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    expect(spy).not.toHaveBeenCalled();

    tick(128);
    expectSingleCallAndReset(spy);

    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    expect(spy).not.toHaveBeenCalled();

    tick(256);
    expectSingleCallAndReset(spy);
  }));

  it('should not immediately call `func` when `wait` is `0`', fakeAsync(() => {
    debouncer.run(spy, 0);
    debouncer.run(spy, 0);
    expect(spy).not.toHaveBeenCalled();

    tick(5);
    expectSingleCallAndReset(spy);
  }));

  it('should invoke the call with the correct arguments', fakeAsync(() => {
    debouncer.run(spy, 32, 'a');
    debouncer.run(spy, 32, 'b', 3);
    tick(64);
    expectSingleCallAndReset(spy, 'b', 3);
  }));

  it('supports recursive calls', fakeAsync(() => {
    const queue = ['b', 'c'];
    const processed: string[] = [];
    const func = (item: string) => {
      processed.push(item);

      const next = queue.shift();
      if (next) {
        debouncer.run(func, 32, next);
      }
    };

    debouncer.run(func, 32, 'a');

    tick(256);
    expect(processed).toEqual(['a', 'b', 'c']);
  }));

  it('should support cancelling delayed calls', fakeAsync(() => {
    debouncer.run(spy, 32);
    debouncer.cancel();

    tick(64);
    expect(spy).not.toHaveBeenCalled();
  }));

  it('should noop `cancel` when nothing is queued', fakeAsync(() => {
    debouncer.cancel();
    tick(64);
    expect().nothing();
  }));
});
