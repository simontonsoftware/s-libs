import { expectSingleCallAndReset } from '@s-libs/ng-vitest';
import type { Mock } from 'vitest';
import { isDefined } from '../predicates';
import { Debouncer } from './debouncer';

describe('Debouncer', () => {
  let debouncer: Debouncer;
  let spy: Mock;
  beforeEach(() => {
    debouncer = new Debouncer();
    spy = vi.fn();

    vi.useFakeTimers();
  });

  it('defaults `wait` to 0', () => {
    debouncer.run(spy);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expectSingleCallAndReset(spy);
  });

  it('can set a different timeout on each run', () => {
    debouncer.run(spy, 1000, 1);
    vi.advanceTimersByTime(500);

    debouncer.run(spy, 0, 2);
    debouncer.run(spy, 1000, 3);
    vi.advanceTimersByTime(500);

    debouncer.run(spy, 2000, 4);
    debouncer.run(spy, 50, 5);
    vi.advanceTimersByTime(50);

    expectSingleCallAndReset(spy, 5);
  });

  it('can use a different function on each run', () => {
    const spy2 = vi.fn();

    debouncer.run(spy, 10);
    debouncer.run(spy2, 10);
    vi.advanceTimersByTime(10);
    expect(spy).not.toHaveBeenCalled();
    expectSingleCallAndReset(spy2);

    debouncer.run(spy);
    vi.advanceTimersByTime(0);
    expectSingleCallAndReset(spy);
    expect(spy2).not.toHaveBeenCalled();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should debounce a function', () => {
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(128);
    expectSingleCallAndReset(spy);

    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    debouncer.run(spy, 32);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(256);
    expectSingleCallAndReset(spy);
  });

  it('should not immediately call `func` when `wait` is `0`', () => {
    debouncer.run(spy, 0);
    debouncer.run(spy, 0);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5);
    expectSingleCallAndReset(spy);
  });

  it('should invoke the call with the correct arguments', () => {
    debouncer.run(spy, 32, 'a');
    debouncer.run(spy, 32, 'b', 3);
    vi.advanceTimersByTime(64);
    expectSingleCallAndReset(spy, 'b', 3);
  });

  it('supports recursive calls', () => {
    const queue = ['b', 'c'];
    const processed: string[] = [];
    function func(item: string): void {
      processed.push(item);

      const next = queue.shift();
      if (isDefined(next)) {
        debouncer.run(func, 32, next);
      }
    }

    debouncer.run(func, 32, 'a');

    vi.advanceTimersByTime(256);
    expect(processed).toEqual(['a', 'b', 'c']);
  });

  it('should support cancelling delayed calls', () => {
    debouncer.run(spy, 32);
    debouncer.cancel();

    vi.advanceTimersByTime(64);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should noop `cancel` when nothing is queued', () => {
    debouncer.cancel();
    vi.advanceTimersByTime(64);
  });
});
