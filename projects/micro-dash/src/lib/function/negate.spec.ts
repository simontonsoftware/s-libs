import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { bind } from 'lodash-es';
import { negate } from './negate';

describe('negate()', () => {
  function isEven(n: number): boolean {
    return n % 2 === 0;
  }

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should create a function that negates the result of `func`', () => {
    const negated = negate(isEven);

    expect(negated(1)).toBe(true);
    expect(negated(2)).toBe(false);
  });

  it('should create a function that negates the result of `func`', () => {
    const negated = negate(isEven);

    expect(negated(1)).toBe(true);
    expect(negated(2)).toBe(false);
  });

  it('should create a function that accepts multiple arguments', () => {
    const spy = jasmine.createSpy();
    const negated = negate(spy);

    negated();
    expectSingleCallAndReset(spy);

    negated(1);
    expectSingleCallAndReset(spy, 1);

    negated(1, 2);
    expectSingleCallAndReset(spy, 1, 2);

    negated(1, 2, 3);
    expectSingleCallAndReset(spy, 1, 2, 3);

    negated(1, 2, 3, 4);
    expectSingleCallAndReset(spy, 1, 2, 3, 4);
  });

  it('should use `this` binding of function', () => {
    function fn(this: any): boolean {
      return this.a;
    }
    const object: any = { a: 1 };

    let negated = negate(bind(fn, object));
    expect(negated()).toBe(false);

    negated = bind(negate(fn), object);
    expect(negated()).toBe(false);

    object.wrapper = negate(fn);
    expect(object.wrapper()).toBe(false);

    const spy = jasmine.createSpy();
    object.spied = negate(spy);
    object.spied();
    expect(spy.calls.mostRecent().object).toBe(object);
  });
});
