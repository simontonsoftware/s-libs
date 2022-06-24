import { expectCallsAndReset, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { isDate, isMap, isNumber, isString } from 'lodash-es';
import {
  isA,
  isDateOrString,
  isMapOrString,
  isNumberOrString,
  isStringOr2,
  keyIsA,
  keyIsAorC,
  keyIsAorNumber,
  keyIsC,
  keyIsNumber,
  keyIsString,
  keyIsString2,
  keyIsString3,
} from '../../test-helpers/test-utils';
import { filter } from './filter';

describe('filter()', () => {
  it('works for objects', () => {
    const object = { a: 1, b: 2, c: 3 };
    expect(filter(object, (item) => item === 2)).toEqual([2]);
    expect(filter(object, (_item, key) => key === 'b')).toEqual([2]);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      //
      // Array
      //

      type A = Array<string | number>;
      const a = [1, 'b'] as A;
      const aOrU = a as A | undefined;
      const aOrN = a as A | null;

      expectTypeOf(filter(a, () => true)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(aOrU, () => true)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(aOrN, () => true)).toEqualTypeOf<
        Array<string | number>
      >();

      // Narrowing

      expectTypeOf(filter(a, isString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(aOrU, isString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(aOrN, isString)).toEqualTypeOf<string[]>();

      expectTypeOf(filter(a, isDateOrString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(aOrU, isDateOrString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(aOrN, isDateOrString)).toEqualTypeOf<string[]>();

      expectTypeOf(filter(a, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(aOrU, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(aOrN, isA)).toEqualTypeOf<Array<'a'>>();

      type AB = Array<'a' | 'b'>;
      const ab = ['a'] as AB;
      const abOrU = ['a'] as AB | undefined;
      const abOrN = ['a'] as AB | null;
      expectTypeOf(filter(ab, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(abOrU, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(abOrN, isA)).toEqualTypeOf<Array<'a'>>();

      type AN = Array<'a' | number>;
      const an = ['a'] as AN;
      const anOrU = ['a'] as AN | undefined;
      const anOrN = ['a'] as AN | null;
      expectTypeOf(filter(an, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();
      expectTypeOf(filter(anOrU, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();
      expectTypeOf(filter(anOrN, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();

      //
      // Object
      //

      interface O {
        a: number;
        2: string;
        c: Date | Document;
      }
      const o = { a: 1, 2: 'b', c: document } as O;
      const oOrU = o as O | undefined;
      const oOrN = o as O | null;

      expectTypeOf(filter(o, () => true)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrU, () => true)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrN, () => true)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();

      // Value narrowing

      expectTypeOf(filter(o, isString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrU, isString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrN, isString)).toEqualTypeOf<string[]>();

      expectTypeOf(filter(o, isDate)).toEqualTypeOf<Date[]>();
      expectTypeOf(filter(oOrU, isDate)).toEqualTypeOf<Date[]>();
      expectTypeOf(filter(oOrN, isDate)).toEqualTypeOf<Date[]>();

      expectTypeOf(filter(o, isNumberOrString)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(oOrU, isNumberOrString)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(oOrN, isNumberOrString)).toEqualTypeOf<
        Array<string | number>
      >();

      expectTypeOf(filter(o, isDateOrString)).toEqualTypeOf<
        Array<string | Date>
      >();
      expectTypeOf(filter(oOrU, isDateOrString)).toEqualTypeOf<
        Array<string | Date>
      >();
      expectTypeOf(filter(oOrN, isDateOrString)).toEqualTypeOf<
        Array<string | Date>
      >();

      expectTypeOf(filter(o, isMap)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(oOrU, isMap)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(oOrN, isMap)).toEqualTypeOf<never[]>();

      expectTypeOf(filter(o, isMapOrString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrU, isMapOrString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrN, isMapOrString)).toEqualTypeOf<string[]>();

      interface S2 {
        a: 'a' | number;
      }
      const s2 = { a: 2 } as S2;
      const s2OrU = { a: 2 } as S2 | undefined;
      const s2OrN = { a: 2 } as S2 | null;
      expectTypeOf(filter(s2, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(s2OrU, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(s2OrN, isA)).toEqualTypeOf<Array<'a'>>();
      expectTypeOf(filter(s2, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();
      expectTypeOf(filter(s2OrU, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();
      expectTypeOf(filter(s2OrN, isStringOr2)).toEqualTypeOf<Array<2 | 'a'>>();

      // Key narrowing

      interface S {
        a: number;
        b: string;
        c: Date | Document;
      }
      const s = { a: 1, b: '2', c: document } as S;
      const sOrU = s as S | undefined;
      const sOrN = s as S | null;

      expectTypeOf(filter(s, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(sOrU, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(sOrN, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(o, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrU, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrN, keyIsString)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();

      expectTypeOf(filter(s, keyIsNumber)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrU, keyIsNumber)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrN, keyIsNumber)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(o, keyIsNumber)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(oOrU, keyIsNumber)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(oOrN, keyIsNumber)).toEqualTypeOf<never[]>();

      expectTypeOf(filter(s, keyIsA)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(sOrU, keyIsA)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(sOrN, keyIsA)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(o, keyIsA)).toEqualTypeOf<Array<string | number>>();
      expectTypeOf(filter(oOrU, keyIsA)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(oOrN, keyIsA)).toEqualTypeOf<
        Array<string | number>
      >();

      expectTypeOf(filter(s, keyIsString2)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrU, keyIsString2)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrN, keyIsString2)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(o, keyIsString2)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrU, keyIsString2)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrN, keyIsString2)).toEqualTypeOf<string[]>();

      expectTypeOf(filter(s, keyIsString3)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrU, keyIsString3)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(sOrN, keyIsString3)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(o, keyIsString3)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrU, keyIsString3)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(oOrN, keyIsString3)).toEqualTypeOf<string[]>();

      expectTypeOf(filter(s, keyIsC)).toEqualTypeOf<Array<Date | Document>>();
      expectTypeOf(filter(sOrU, keyIsC)).toEqualTypeOf<
        Array<Date | Document>
      >();
      expectTypeOf(filter(sOrN, keyIsC)).toEqualTypeOf<
        Array<Date | Document>
      >();
      expectTypeOf(filter(o, keyIsC)).toEqualTypeOf<
        Array<string | Date | Document>
      >();
      expectTypeOf(filter(oOrU, keyIsC)).toEqualTypeOf<
        Array<string | Date | Document>
      >();
      expectTypeOf(filter(oOrN, keyIsC)).toEqualTypeOf<
        Array<string | Date | Document>
      >();

      expectTypeOf(filter(s, keyIsAorC)).toEqualTypeOf<
        Array<number | Date | Document>
      >();
      expectTypeOf(filter(sOrU, keyIsAorC)).toEqualTypeOf<
        Array<number | Date | Document>
      >();
      expectTypeOf(filter(sOrN, keyIsAorC)).toEqualTypeOf<
        Array<number | Date | Document>
      >();
      expectTypeOf(filter(o, keyIsAorC)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrU, keyIsAorC)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();
      expectTypeOf(filter(oOrN, keyIsAorC)).toEqualTypeOf<
        Array<string | number | Date | Document>
      >();

      expectTypeOf(filter(s, keyIsAorNumber)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(sOrU, keyIsAorNumber)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(sOrN, keyIsAorNumber)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(o, keyIsAorNumber)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(oOrU, keyIsAorNumber)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(oOrN, keyIsAorNumber)).toEqualTypeOf<
        Array<string | number>
      >();

      const so = {} as Record<string, number | string>;
      expectTypeOf(filter(so, isString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(so, isNumber)).toEqualTypeOf<number[]>();
      expectTypeOf(filter(so, isDate)).toEqualTypeOf<never[]>();
      expectTypeOf(filter(so, isDateOrString)).toEqualTypeOf<string[]>();
      expectTypeOf(filter(so, keyIsString)).toEqualTypeOf<
        Array<string | number>
      >();
      expectTypeOf(filter(so, keyIsA)).toEqualTypeOf<Array<string | number>>();
      expectTypeOf(filter(so, keyIsNumber)).toEqualTypeOf<never[]>();
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return elements `predicate` returns truthy for', () => {
    expect(filter([1, 2, 3], (item) => item === 2)).toEqual([2]);
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    filter([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, 0]);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    filter(array, spy);

    expectCallsAndReset(spy, [1, 0], [undefined, 1], [3, 2]);
  });

  it('should not iterate custom properties of arrays', () => {
    const array = [1];
    (array as any).a = 1;
    const spy = jasmine.createSpy();

    filter(array, spy);

    expectCallsAndReset(spy, [1, 0]);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    filter(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    filter(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should accept falsey arguments', () => {
    expect(filter(null, () => true)).toEqual([]);
    expect(filter(undefined, () => true)).toEqual([]);
  });

  it('should return an array', () => {
    const array = [1, 2, 3];
    const actual = filter(array, () => true);

    expect(actual).toEqual(jasmine.any(Array));
    expect(actual).not.toBe(array);
  });
});
