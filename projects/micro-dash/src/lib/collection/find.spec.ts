import { expectTypeOf } from 'expect-type';
import { isDate, isMap, isNumber, isString, matches } from 'lodash-es';
import { expectCallsAndReset, expectSingleCallAndReset } from '@s-libs/ng-dev';
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
import { find } from './find';

describe('find()', () => {
  it('has fancy typing for arrays', () => {
    expect().nothing();

    type A = Array<string | number>;
    const a = [1, 'b'] as A;
    const aOrU = a as A | undefined;
    const aOrN = a as A | null;

    expectTypeOf(find(a, () => true)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(a, () => true, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(aOrU, () => true)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(aOrU, () => true, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(aOrN, () => true)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(aOrN, () => true, 1)).toEqualTypeOf<
      string | number | undefined
    >();

    // Narrowing

    expectTypeOf(find(a, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(a, isString, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(aOrU, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(aOrU, isString, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(aOrN, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(aOrN, isString, 1)).toEqualTypeOf<string | undefined>();

    expectTypeOf(find(a, isDateOrString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(a, isDateOrString, 1)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(aOrU, isDateOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(aOrU, isDateOrString, 1)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(aOrN, isDateOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(aOrN, isDateOrString, 1)).toEqualTypeOf<
      string | undefined
    >();

    expectTypeOf(find(a, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(aOrU, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(aOrN, isA)).toEqualTypeOf<'a' | undefined>();

    type AB = Array<'a' | 'b'>;
    const ab = ['a'] as AB;
    const abOrU = ['a'] as AB | undefined;
    const abOrN = ['a'] as AB | null;
    expectTypeOf(find(ab, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(abOrU, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(abOrN, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(ab, isString)).toEqualTypeOf<'a' | 'b' | undefined>();
    expectTypeOf(find(abOrU, isString)).toEqualTypeOf<'a' | 'b' | undefined>();
    expectTypeOf(find(abOrN, isString)).toEqualTypeOf<'a' | 'b' | undefined>();

    type AN = Array<'a' | number>;
    const an = ['a'] as AN;
    const anOrN = ['a'] as AN | null;
    const anOrU = ['a'] as AN | undefined;
    expectTypeOf(find(an, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(anOrU, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(anOrN, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
  });

  it('has fancy typing for objects', () => {
    expect().nothing();

    interface O {
      a: number;
      2: string;
      c: Date | Document;
    }
    const o = { a: 1, 2: 'b', c: document } as O;
    const oOrU = o as O | undefined;
    const oOrN = o as O | null;

    expectTypeOf(find(o, () => true)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(o, () => true, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, () => true)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, () => true, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, () => true)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, () => true, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();

    // Value narrowing

    expectTypeOf(find(o, isString)).toEqualTypeOf<string>();
    expectTypeOf(find(o, isString, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(o, isString, 1 as number | undefined)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(oOrU, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, isString, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrN, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrN, isString, 1)).toEqualTypeOf<string | undefined>();

    expectTypeOf(find(o, isDate)).toEqualTypeOf<Date | undefined>();
    expectTypeOf(find(o, isDate, 1)).toEqualTypeOf<Date | undefined>();
    expectTypeOf(find(oOrU, isDate)).toEqualTypeOf<Date | undefined>();
    expectTypeOf(find(oOrU, isDate, 1)).toEqualTypeOf<Date | undefined>();
    expectTypeOf(find(oOrN, isDate)).toEqualTypeOf<Date | undefined>();
    expectTypeOf(find(oOrN, isDate, 1)).toEqualTypeOf<Date | undefined>();

    expectTypeOf(find(o, isNumberOrString)).toEqualTypeOf<string | number>();
    expectTypeOf(find(o, isNumberOrString, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, isNumberOrString)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, isNumberOrString, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, isNumberOrString)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, isNumberOrString, 1)).toEqualTypeOf<
      string | number | undefined
    >();

    expectTypeOf(find(o, isDateOrString)).toEqualTypeOf<string | Date>();
    expectTypeOf(find(o, isDateOrString, 1)).toEqualTypeOf<
      string | Date | undefined
    >();
    expectTypeOf(find(oOrU, isDateOrString)).toEqualTypeOf<
      string | Date | undefined
    >();
    expectTypeOf(find(oOrU, isDateOrString, 1)).toEqualTypeOf<
      string | Date | undefined
    >();
    expectTypeOf(find(oOrN, isDateOrString)).toEqualTypeOf<
      string | Date | undefined
    >();
    expectTypeOf(find(oOrN, isDateOrString, 1)).toEqualTypeOf<
      string | Date | undefined
    >();

    expectTypeOf(find(o, isMap)).toEqualTypeOf<undefined>();
    expectTypeOf(find(o, isMap, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrU, isMap)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrU, isMap, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrN, isMap)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrN, isMap, 1)).toEqualTypeOf<undefined>();

    expectTypeOf(find(o, isMapOrString)).toEqualTypeOf<string>();
    expectTypeOf(find(o, isMapOrString, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(o, isMapOrString, 1 as number | undefined)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(oOrU, isMapOrString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, isMapOrString, 1)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(oOrN, isMapOrString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrN, isMapOrString, 1)).toEqualTypeOf<
      string | undefined
    >();

    interface S2 {
      a: 'a' | number;
    }
    const s2 = { a: 2 } as S2;
    const s2OrU = { a: 2 } as S2 | undefined;
    const s2OrN = { a: 2 } as S2 | null;
    expectTypeOf(find(s2, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2, isA, 1)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2OrU, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2OrU, isA, 1)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2OrN, isA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2OrN, isA, 1)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(find(s2, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(s2, isStringOr2, 1)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(s2OrU, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(s2OrU, isStringOr2, 1)).toEqualTypeOf<
      2 | 'a' | undefined
    >();
    expectTypeOf(find(s2OrN, isStringOr2)).toEqualTypeOf<2 | 'a' | undefined>();
    expectTypeOf(find(s2OrN, isStringOr2, 1)).toEqualTypeOf<
      2 | 'a' | undefined
    >();

    // Key narrowing

    interface S {
      a: number;
      b: string;
      c: Date | Document;
    }
    const s = { a: 1, b: '2', c: document } as S;
    const sOrU = s as S | undefined;
    const sOrN = s as S | null;

    expectTypeOf(find(s, keyIsString)).toEqualTypeOf<
      string | number | Date | Document
    >();
    expectTypeOf(find(s, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsString)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsString)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(o, keyIsString)).toEqualTypeOf<
      string | number | Date | Document
    >();
    expectTypeOf(find(o, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsString)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsString)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsString, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();

    expectTypeOf(find(s, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(s, keyIsNumber, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsNumber, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsNumber, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(o, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(o, keyIsNumber, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrU, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrU, keyIsNumber, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrN, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(find(oOrN, keyIsNumber, 1)).toEqualTypeOf<undefined>();

    expectTypeOf(find(s, keyIsA)).toEqualTypeOf<number>();
    expectTypeOf(find(s, keyIsA, 1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(sOrU, keyIsA)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(sOrU, keyIsA, 1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(sOrN, keyIsA)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(sOrN, keyIsA, 1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(o, keyIsA)).toEqualTypeOf<string | number>();
    expectTypeOf(find(o, keyIsA, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, keyIsA)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, keyIsA, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, keyIsA)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, keyIsA, 1)).toEqualTypeOf<
      string | number | undefined
    >();

    expectTypeOf(find(s, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(find(s, keyIsString2, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsString2, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsString2, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(o, keyIsString2)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(o, keyIsString2, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, keyIsString2)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, keyIsString2, 1)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(oOrN, keyIsString2)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrN, keyIsString2, 1)).toEqualTypeOf<
      string | undefined
    >();

    expectTypeOf(find(s, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(find(s, keyIsString3, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrU, keyIsString3, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(find(sOrN, keyIsString3, 1)).toEqualTypeOf<undefined>();
    expectTypeOf(find(o, keyIsString3)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(o, keyIsString3, 1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, keyIsString3)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrU, keyIsString3, 1)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(find(oOrN, keyIsString3)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(oOrN, keyIsString3, 1)).toEqualTypeOf<
      string | undefined
    >();

    expectTypeOf(find(s, keyIsC)).toEqualTypeOf<Date | Document>();
    expectTypeOf(find(s, keyIsC, 1)).toEqualTypeOf<
      Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsC)).toEqualTypeOf<
      Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsC, 1)).toEqualTypeOf<
      Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsC)).toEqualTypeOf<
      Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsC, 1)).toEqualTypeOf<
      Date | Document | undefined
    >();
    expectTypeOf(find(o, keyIsC)).toEqualTypeOf<string | Date | Document>();
    expectTypeOf(find(o, keyIsC, 1)).toEqualTypeOf<
      string | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsC)).toEqualTypeOf<
      string | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsC, 1)).toEqualTypeOf<
      string | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsC)).toEqualTypeOf<
      string | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsC, 1)).toEqualTypeOf<
      string | Date | Document | undefined
    >();

    expectTypeOf(find(s, keyIsAorC)).toEqualTypeOf<number | Date | Document>();
    expectTypeOf(find(s, keyIsAorC, 1)).toEqualTypeOf<
      number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsAorC)).toEqualTypeOf<
      number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrU, keyIsAorC, 1)).toEqualTypeOf<
      number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsAorC)).toEqualTypeOf<
      number | Date | Document | undefined
    >();
    expectTypeOf(find(sOrN, keyIsAorC, 1)).toEqualTypeOf<
      number | Date | Document | undefined
    >();
    expectTypeOf(find(o, keyIsAorC)).toEqualTypeOf<
      string | number | Date | Document
    >();
    expectTypeOf(find(o, keyIsAorC, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsAorC)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrU, keyIsAorC, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsAorC)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();
    expectTypeOf(find(oOrN, keyIsAorC, 1)).toEqualTypeOf<
      string | number | Date | Document | undefined
    >();

    expectTypeOf(find(s, keyIsAorNumber)).toEqualTypeOf<number>();
    expectTypeOf(find(s, keyIsAorNumber, 1)).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(find(sOrU, keyIsAorNumber)).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(find(sOrU, keyIsAorNumber, 1)).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(find(sOrN, keyIsAorNumber)).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(find(sOrN, keyIsAorNumber, 1)).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(find(o, keyIsAorNumber)).toEqualTypeOf<string | number>();
    expectTypeOf(find(o, keyIsAorNumber, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, keyIsAorNumber)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrU, keyIsAorNumber, 1)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, keyIsAorNumber)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(find(oOrN, keyIsAorNumber, 1)).toEqualTypeOf<
      string | number | undefined
    >();

    const so = {} as { [key: string]: number | string };
    expectTypeOf(find(so, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(so, isNumber)).toEqualTypeOf<number | undefined>();
    expectTypeOf(find(so, isDate)).toEqualTypeOf<undefined>();
    expectTypeOf(find(so, isDateOrString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(find(so, keyIsString)).toEqualTypeOf<string | number>();
    expectTypeOf(find(so, keyIsA)).toEqualTypeOf<string | number | undefined>();
    expectTypeOf(find(so, keyIsNumber)).toEqualTypeOf<undefined>();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  const objects = [
    { a: 0, b: 0 },
    { a: 1, b: 1 },
    { a: 2, b: 2 },
  ];

  it('should return the found value', () => {
    expect(find(objects, (object) => !!object.a)).toBe(objects[1]);
  });

  it('should return `undefined` if value is not found', () => {
    expect(find(objects, (object) => object.a === 3)).toBe(undefined);
  });

  it('should return `undefined` for empty collections', () => {
    expect(find({}, matches({ a: 3 }))).toBe(undefined);
    expect(find([], matches({ a: 3 }))).toBe(undefined);
    expect(find(false, matches({ a: 3 }))).toBe(undefined);
    expect(find(0, matches({ a: 3 }))).toBe(undefined);
    expect(find('', matches({ a: 3 }))).toBe(undefined);
    expect(find(null, matches({ a: 3 }))).toBe(undefined);
    expect(find(undefined, matches({ a: 3 }))).toBe(undefined);
    expect(find(NaN, matches({ a: 3 }))).toBe(undefined);
  });

  it('should provide correct `predicate` arguments for arrays', () => {
    const spy = jasmine.createSpy();
    find(['a'], spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('a', 0);
  });

  it('should work with an object for `collection`', () => {
    expect(find({ a: 1, b: 2, c: 3 }, (n) => n < 3)).toBe(1);
  });

  it('should provide correct `predicate` arguments for objects', () => {
    const spy = jasmine.createSpy();
    find({ a: 1 }, spy);
    expectSingleCallAndReset(spy, 1, 'a');
  });

  it('should work with an array and a positive `fromIndex`', () => {
    const array = [1, 2, 3];
    expect(find(array, (n) => n === 3, 2)).toBe(3);
    expect(find(array, (n) => n === 2, 2)).toBe(undefined);
  });

  it('should work with an array and a `fromIndex` >= `length`', () => {
    const array = [1, 2, 3];
    for (const key of [1, undefined, '']) {
      for (const fromIndex of [4, 6, 2 ** 32, Infinity]) {
        expect(find(array, (n) => Object.is(n, key), fromIndex)).toBe(
          undefined,
        );
      }
    }
  });

  it('should work with an array and coerce `fromIndex` to an integer', () => {
    const array = [1, 2, 3];
    expect(find(array, (n) => n === 1, 0.1)).toBe(1);
    expect(find(array, (n) => n === 1, NaN)).toBe(1);
  });

  it('should work with an array and a negative `fromIndex`', () => {
    const array = [1, 2, 3];
    expect(find(array, (n) => n === 3, -1)).toBe(3);
    expect(find(array, (n) => n === 2, -1)).toBe(undefined);
  });

  it('should work with an array and a negative `fromIndex` <= `-length`', () => {
    const array = [1, 2, 3];
    for (const fromIndex of [-4, -6, -Infinity]) {
      expect(find(array, (n) => n === 1, fromIndex)).toBe(1);
    }
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    find([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, 0]);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    find(array, spy);

    expectCallsAndReset(spy, [1, 0], [undefined, 1], [3, 2]);
  });

  it('should not iterate custom properties of arrays', () => {
    const array = [1];
    (array as any).a = 1;
    const spy = jasmine.createSpy();

    find(array, spy);

    expectCallsAndReset(spy, [1, 0]);
  });

  it('iterates over own string keyed properties of objects', () => {
    const object = { a: 1 };
    const spy = jasmine.createSpy();

    find(object, spy);

    expectCallsAndReset(spy, [1, 'a']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return false;
    });

    find(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return false;
    });

    find(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
