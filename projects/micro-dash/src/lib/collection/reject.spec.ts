import { expectCallsAndReset } from '@s-libs/ng-dev';
import { reject } from './reject';

describe('reject()', () => {
  it('works for objects', () => {
    const object = { a: 1, b: 2, c: 3 };
    expect(reject(object, (item) => item === 2)).toEqual([1, 3]);
    expect(reject(object, (_item, key) => key === 'b')).toEqual([1, 3]);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return elements the `predicate` returns falsey for', () => {
    expect(reject([1, 2, 3], (item) => item === 2)).toEqual([1, 3]);
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    reject([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, 0]);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    reject(array, spy);

    expectCallsAndReset(spy, [1, 0], [undefined, 1], [3, 2]);
  });

  it('should not iterate custom properties of arrays', () => {
    const array = [1];
    (array as any).a = 1;
    const spy = jasmine.createSpy();

    reject(array, spy);

    expectCallsAndReset(spy, [1, 0]);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    reject(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    reject(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should accept falsey arguments', () => {
    expect(reject(null, () => true)).toEqual([]);
    expect(reject(undefined, () => true)).toEqual([]);
  });

  it('should return an array', () => {
    const array = [1, 2, 3];
    const actual = reject(array, () => true);

    expect(actual).toEqual(jasmine.any(Array));
    expect(actual).not.toBe(array);
  });
});
