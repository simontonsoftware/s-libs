import { expectTypeOf } from 'expect-type';
import { keyBy } from './key-by';

describe('keyBy()', () => {
  it('works with nil', () => {
    expect(keyBy(null, () => 'a')).toEqual({});
    expect(keyBy(undefined, () => 'a')).toEqual({});
  });

  it('has fancy typing', () => {
    expect().nothing();

    const mapper = (value: number) => (value % 2 ? 'odd' : 'even');
    interface O {
      a: number;
      b: number;
    }
    type A = number[];
    interface OddEven {
      odd?: number;
      even?: number;
    }

    expectTypeOf(keyBy([1, 2], mapper)).toEqualTypeOf<OddEven>();
    expectTypeOf(keyBy({ a: 1, b: 2 }, mapper)).toEqualTypeOf<OddEven>();

    const oOrN = null as O | null;
    const oOrU = undefined as O | undefined;
    const aOrN = null as A | null;
    const aOrU = undefined as A | undefined;

    expectTypeOf(keyBy(oOrN, mapper)).toEqualTypeOf<OddEven>();
    expectTypeOf(keyBy(oOrU, mapper)).toEqualTypeOf<OddEven>();
    expectTypeOf(keyBy(aOrN, mapper)).toEqualTypeOf<OddEven>();
    expectTypeOf(keyBy(aOrU, mapper)).toEqualTypeOf<OddEven>();

    type City = 'Nairobi' | 'Gulu';
    const chooseMany: City[] = ['Nairobi', 'Gulu'];
    expectTypeOf(keyBy(chooseMany, (city) => city)).toEqualTypeOf<{
      Nairobi?: 'Nairobi' | 'Gulu' | undefined;
      Gulu?: 'Nairobi' | 'Gulu' | undefined;
    }>();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    keyBy([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1]);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    keyBy(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    keyBy(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should transform keys by `iteratee`', () => {
    const array = [
      { dir: 'left', code: 97 },
      { dir: 'right', code: 100 },
    ];

    expect(keyBy(array, (object) => String.fromCharCode(object.code))).toEqual({
      a: { dir: 'left', code: 97 },
      d: { dir: 'right', code: 100 },
    });
  });

  it('should only add values to own, not inherited, properties', () => {
    const actual: any = keyBy([6.1, 4.2, 6.3], (n) =>
      Math.floor(n) > 4 ? 'hasOwnProperty' : 'constructor',
    );

    expect(actual.constructor).toEqual(4.2);
    expect(actual.hasOwnProperty).toEqual(6.3);
  });

  it('should work with an object for `collection`', () => {
    expect(keyBy({ a: 6.1, b: 4.2, c: 6.3 }, Math.floor)).toEqual({
      4: 4.2,
      6: 6.3,
    });
  });
});
