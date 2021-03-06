import { noop } from 'lodash';
import { expectCallsAndReset, expectSingleCallAndReset } from '@s-libs/ng-dev';
import { forOwnRight } from './for-own-right';

describe('forOwnRight()', () => {
  //
  // stolen from https://github.com/lodash/lodash
  //

  it('can exit early when iterating arrays', () => {
    const spy = jasmine.createSpy().and.returnValue(false);
    forOwnRight([1, 2, 3], spy);
    expectSingleCallAndReset(spy, 3, '2');
  });

  it('can exit early when iterating objects', () => {
    const spy = jasmine.createSpy().and.returnValue(false);
    forOwnRight({ a: 1, b: 2, c: 3 }, spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should iterate over `length` properties', () => {
    const logger = jasmine.createSpy();

    forOwnRight({ 0: 'zero', 1: 'one', length: 2 }, logger);

    expect(logger.calls.allArgs()).toContain([2, 'length']);
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    forOwnRight([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([3, '2']);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    forOwnRight(array, spy);

    expectCallsAndReset(spy, [3, '2'], [1, '0']);
  });

  it('should return the collection', () => {
    const array = [1, 2, 3];

    expect(forOwnRight(array, noop)).toBe(array);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    forOwnRight(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    forOwnRight(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
