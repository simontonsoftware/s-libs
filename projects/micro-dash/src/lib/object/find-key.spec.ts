import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { isDate, isMap, isNumber, isString, matches } from 'lodash-es';
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
import { findKey } from './find-key';

describe('findKey()', () => {
  it('has fancy typing', () => {
    expect().nothing();

    //
    // Array
    //
    type A = Array<string | number>;
    const a = [1, 'b'] as A;
    const aOrU = a as A | undefined;
    const aOrN = a as A | null;

    expectTypeOf(findKey(a, () => true)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(aOrU, () => true)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(aOrN, () => true)).toEqualTypeOf<string | undefined>();

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

    interface S {
      a: number;
      b: string;
      c: Date | Document;
    }
    const s = { a: 1, b: '2', c: document } as S;
    const sOrU = s as S | undefined;
    const sOrN = s as S | null;

    expectTypeOf(findKey(o, () => true)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(oOrU, () => true)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(oOrN, () => true)).toEqualTypeOf<string | undefined>();

    expectTypeOf(findKey(s, () => true)).toEqualTypeOf<
      'a' | 'b' | 'c' | undefined
    >();
    expectTypeOf(findKey(sOrU, () => true)).toEqualTypeOf<
      'a' | 'b' | 'c' | undefined
    >();
    expectTypeOf(findKey(sOrN, () => true)).toEqualTypeOf<
      'a' | 'b' | 'c' | undefined
    >();

    // Value narrowing

    expectTypeOf(findKey(o, isString)).toEqualTypeOf<string>();
    expectTypeOf(findKey(oOrU, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(oOrN, isString)).toEqualTypeOf<string | undefined>();

    expectTypeOf(findKey(o, isDate)).toEqualTypeOf<'c' | undefined>();
    expectTypeOf(findKey(oOrU, isDate)).toEqualTypeOf<'c' | undefined>();
    expectTypeOf(findKey(oOrN, isDate)).toEqualTypeOf<'c' | undefined>();

    expectTypeOf(findKey(o, isNumberOrString)).toEqualTypeOf<string>();
    expectTypeOf(findKey(oOrU, isNumberOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(oOrN, isNumberOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(s, isNumberOrString)).toEqualTypeOf<'a' | 'b'>();
    expectTypeOf(findKey(sOrU, isNumberOrString)).toEqualTypeOf<
      'a' | 'b' | undefined
    >();
    expectTypeOf(findKey(sOrN, isNumberOrString)).toEqualTypeOf<
      'a' | 'b' | undefined
    >();

    expectTypeOf(findKey(s, isDateOrString)).toEqualTypeOf<'b' | 'c'>();
    expectTypeOf(findKey(sOrU, isDateOrString)).toEqualTypeOf<
      'b' | 'c' | undefined
    >();
    expectTypeOf(findKey(sOrN, isDateOrString)).toEqualTypeOf<
      'b' | 'c' | undefined
    >();

    expectTypeOf(findKey(o, isMap)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(oOrU, isMap)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(oOrN, isMap)).toEqualTypeOf<undefined>();

    expectTypeOf(findKey(o, isMapOrString)).toEqualTypeOf<string>();
    expectTypeOf(findKey(oOrU, isMapOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(oOrN, isMapOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(s, isMapOrString)).toEqualTypeOf<'b'>();
    expectTypeOf(findKey(sOrU, isMapOrString)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(sOrN, isMapOrString)).toEqualTypeOf<'b' | undefined>();

    interface S2 {
      b: 'a' | number;
    }
    const s2 = { b: 2 } as S2;
    const s2OrU = s2 as S2 | undefined;
    const s2OrN = s2 as S2 | null;
    expectTypeOf(findKey(s2, isA)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(s2OrU, isA)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(s2OrN, isA)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(s2, isStringOr2)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(s2OrU, isStringOr2)).toEqualTypeOf<'b' | undefined>();
    expectTypeOf(findKey(s2OrN, isStringOr2)).toEqualTypeOf<'b' | undefined>();

    // Key narrowing

    expectTypeOf(findKey(s, keyIsString)).toEqualTypeOf<'a' | 'b' | 'c'>();
    expectTypeOf(findKey(sOrU, keyIsString)).toEqualTypeOf<
      'a' | 'b' | 'c' | undefined
    >();
    expectTypeOf(findKey(sOrN, keyIsString)).toEqualTypeOf<
      'a' | 'b' | 'c' | undefined
    >();
    expectTypeOf(findKey(o, keyIsString)).toEqualTypeOf<string>();
    expectTypeOf(findKey(oOrU, keyIsString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(oOrN, keyIsString)).toEqualTypeOf<
      string | undefined
    >();

    expectTypeOf(findKey(s, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrU, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrN, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(o, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(oOrU, keyIsNumber)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(oOrN, keyIsNumber)).toEqualTypeOf<undefined>();

    expectTypeOf(findKey(s, keyIsA)).toEqualTypeOf<'a'>();
    expectTypeOf(findKey(sOrU, keyIsA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(findKey(sOrN, keyIsA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(findKey(o, keyIsA)).toEqualTypeOf<'a'>();
    expectTypeOf(findKey(oOrU, keyIsA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(findKey(oOrN, keyIsA)).toEqualTypeOf<'a' | undefined>();

    expectTypeOf(findKey(s, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrU, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrN, keyIsString2)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(o, keyIsString2)).toEqualTypeOf<'2' | undefined>();
    expectTypeOf(findKey(oOrU, keyIsString2)).toEqualTypeOf<'2' | undefined>();
    expectTypeOf(findKey(oOrN, keyIsString2)).toEqualTypeOf<'2' | undefined>();

    expectTypeOf(findKey(s, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrU, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(sOrN, keyIsString3)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(o, keyIsString3)).toEqualTypeOf<'3' | undefined>();
    expectTypeOf(findKey(oOrU, keyIsString3)).toEqualTypeOf<'3' | undefined>();
    expectTypeOf(findKey(oOrN, keyIsString3)).toEqualTypeOf<'3' | undefined>();

    expectTypeOf(findKey(s, keyIsC)).toEqualTypeOf<'c'>();
    expectTypeOf(findKey(sOrU, keyIsC)).toEqualTypeOf<'c' | undefined>();
    expectTypeOf(findKey(sOrN, keyIsC)).toEqualTypeOf<'c' | undefined>();
    expectTypeOf(findKey(o, keyIsC)).toEqualTypeOf<'c'>();
    expectTypeOf(findKey(oOrU, keyIsC)).toEqualTypeOf<'c' | undefined>();
    expectTypeOf(findKey(oOrN, keyIsC)).toEqualTypeOf<'c' | undefined>();

    expectTypeOf(findKey(s, keyIsAorC)).toEqualTypeOf<'a' | 'c'>();
    expectTypeOf(findKey(sOrU, keyIsAorC)).toEqualTypeOf<
      'a' | 'c' | undefined
    >();
    expectTypeOf(findKey(sOrN, keyIsAorC)).toEqualTypeOf<
      'a' | 'c' | undefined
    >();
    expectTypeOf(findKey(o, keyIsAorC)).toEqualTypeOf<'a' | 'c'>();
    expectTypeOf(findKey(oOrU, keyIsAorC)).toEqualTypeOf<
      'a' | 'c' | undefined
    >();
    expectTypeOf(findKey(oOrN, keyIsAorC)).toEqualTypeOf<
      'a' | 'c' | undefined
    >();

    expectTypeOf(findKey(s, keyIsAorNumber)).toEqualTypeOf<'a'>();
    expectTypeOf(findKey(sOrU, keyIsAorNumber)).toEqualTypeOf<
      'a' | undefined
    >();
    expectTypeOf(findKey(sOrN, keyIsAorNumber)).toEqualTypeOf<
      'a' | undefined
    >();
    expectTypeOf(findKey(o, keyIsAorNumber)).toEqualTypeOf<'a'>();
    expectTypeOf(findKey(oOrU, keyIsAorNumber)).toEqualTypeOf<
      'a' | undefined
    >();
    expectTypeOf(findKey(oOrN, keyIsAorNumber)).toEqualTypeOf<
      'a' | undefined
    >();

    const so = {} as { [key: string]: number | string };
    expectTypeOf(findKey(so, isString)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(so, isNumber)).toEqualTypeOf<string | undefined>();
    expectTypeOf(findKey(so, isDate)).toEqualTypeOf<undefined>();
    expectTypeOf(findKey(so, isDateOrString)).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(findKey(so, keyIsString)).toEqualTypeOf<string>();
    expectTypeOf(findKey(so, keyIsA)).toEqualTypeOf<'a' | undefined>();
    expectTypeOf(findKey(so, keyIsNumber)).toEqualTypeOf<undefined>();
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
    expect(findKey(objects, (object) => !!object.a)).toBe('1');
  });

  it('should return `undefined` if value is not found', () => {
    expect(findKey(objects, (object) => object.a === 3)).toBe(undefined);
  });

  it('should return `undefined` for empty collections', () => {
    expect(findKey({}, matches({ a: 3 }))).toBe(undefined);
    expect(findKey([], matches({ a: 3 }))).toBe(undefined);
    expect(findKey(false, matches({ a: 3 }))).toBe(undefined);
    expect(findKey(0, matches({ a: 3 }))).toBe(undefined);
    expect(findKey('', matches({ a: 3 }))).toBe(undefined);
    expect(findKey(null, matches({ a: 3 }))).toBe(undefined);
    expect(findKey(undefined, matches({ a: 3 }))).toBe(undefined);
    expect(findKey(NaN, matches({ a: 3 }))).toBe(undefined);
  });

  it('should work with an object for `collection`', () => {
    expect(findKey({ a: 1, b: 2, c: 3 }, (n) => n < 3)).toBe('a');
  });

  it('should provide correct `predicate` arguments for objects', () => {
    const spy = jasmine.createSpy();
    findKey({ a: 1 }, spy);
    expectSingleCallAndReset(spy, 1, 'a');
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    findKey([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, '0']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return false;
    });

    findKey(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return false;
    });

    findKey(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
