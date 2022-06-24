import { staticTest } from '@s-libs/ng-dev';
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
  keyIsDateOrString,
  keyIsNumber,
  keyIsString,
  keyIsString2,
  keyIsString3,
} from '../../test-helpers/test-utils';
import { omitBy } from './omit-by';

describe('omitBy()', () => {
  // lodash's test (and behavior) is the opposite
  it('does not treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const logger = jasmine.createSpy();

    omitBy(array, logger);

    expect(logger.calls.allArgs()).toEqual([
      [1, '0'],
      [3, '2'],
    ]);
  });

  // lodash's test for `omit`, but not `omitBy`, even though the behavior is the same
  it('should return an empty object when `object` is nullish', () => {
    expect(omitBy<any>(null, () => true)).toEqual({});
    expect(omitBy<any>(undefined, () => false)).toEqual({});
  });

  it('passing number keys as strings', () => {
    expect(omitBy({ a: 1, 2: 'b' }, keyIsString)).toEqual({});
  });

  it('has fancy typing', () => {
    staticTest(() => {
      //
      // Array
      //

      type A = Array<string | number>;
      const a = {} as A;
      const aOrU = {} as A | undefined;
      const aOrN = {} as A | null;

      expectTypeOf(omitBy(a, () => true)).toEqualTypeOf<
        Record<number, string | number>
      >();
      expectTypeOf(omitBy(aOrU, () => true)).toEqualTypeOf<
        Record<number, string | number>
      >();
      expectTypeOf(omitBy(aOrN, () => true)).toEqualTypeOf<
        Record<number, string | number>
      >();

      // narrowing

      expectTypeOf(omitBy(a, isString)).toEqualTypeOf<Record<number, number>>();
      expectTypeOf(omitBy(aOrU, isString)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(omitBy(aOrN, isString)).toEqualTypeOf<
        Record<number, number>
      >();

      expectTypeOf(omitBy(a, isDateOrString)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(omitBy(aOrU, isDateOrString)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(omitBy(aOrN, isDateOrString)).toEqualTypeOf<
        Record<number, number>
      >();

      expectTypeOf(omitBy(a, isA)).toEqualTypeOf<
        Record<number, string | number>
      >();
      expectTypeOf(omitBy(aOrU, isA)).toEqualTypeOf<
        Record<number, string | number>
      >();
      expectTypeOf(omitBy(aOrN, isA)).toEqualTypeOf<
        Record<number, string | number>
      >();

      type AB = Array<'a' | 'b'>;
      const ab = {} as AB;
      const abOrU = {} as AB | undefined;
      const abOrN = {} as AB | null;
      expectTypeOf(omitBy(ab, isA)).toEqualTypeOf<Record<number, 'b'>>();
      expectTypeOf(omitBy(abOrU, isA)).toEqualTypeOf<Record<number, 'b'>>();
      expectTypeOf(omitBy(abOrN, isA)).toEqualTypeOf<Record<number, 'b'>>();

      type AN = Array<'a' | number>;
      const an = {} as AN;
      const anOrU = {} as AN | undefined;
      const anOrN = {} as AN | null;
      expectTypeOf(omitBy(an, isStringOr2)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(omitBy(anOrU, isStringOr2)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(omitBy(anOrN, isStringOr2)).toEqualTypeOf<
        Record<number, number>
      >();

      //
      // Object
      //

      interface O {
        a: number;
        2: string;
        c: Date | Document;
      }
      const o = {} as O;
      const oOrU = {} as O | undefined;
      const oOrN = {} as O | null;
      expectTypeOf(omitBy(o, () => true)).toEqualTypeOf<{
        2?: string | undefined;
        a?: number | undefined;
        c?: Date | Document | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, () => true)).toEqualTypeOf<{
        2?: string | undefined;
        a?: number | undefined;
        c?: Date | Document | undefined;
      }>();
      expectTypeOf(omitBy(oOrN, () => true)).toEqualTypeOf<{
        2?: string | undefined;
        a?: number | undefined;
        c?: Date | Document | undefined;
      }>();

      // value narrowing

      expectTypeOf(omitBy(o, isString)).toEqualTypeOf<{
        a: number;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(oOrU, isString)).toEqualTypeOf<
        { a: number; c: Date | Document } | {}
      >();
      expectTypeOf(omitBy(oOrN, isString)).toEqualTypeOf<
        { a: number; c: Date | Document } | {}
      >();

      expectTypeOf(omitBy(o, isDate)).toEqualTypeOf<{
        c?: Document | undefined;
        2: string;
        a: number;
      }>();
      expectTypeOf(omitBy(oOrU, isDate)).toEqualTypeOf<
        {} | { c?: Document | undefined; 2: string; a: number }
      >();
      expectTypeOf(omitBy(oOrN, isDate)).toEqualTypeOf<
        {} | { c?: Document | undefined; 2: string; a: number }
      >();

      expectTypeOf(omitBy(o, isNumberOrString)).toEqualTypeOf<{
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(oOrU, isNumberOrString)).toEqualTypeOf<
        {} | { c: Date | Document }
      >();
      expectTypeOf(omitBy(oOrN, isNumberOrString)).toEqualTypeOf<
        {} | { c: Date | Document }
      >();

      expectTypeOf(omitBy(o, isDateOrString)).toEqualTypeOf<{
        c?: Document | undefined;
        a: number;
      }>();
      expectTypeOf(omitBy(oOrU, isDateOrString)).toEqualTypeOf<
        {} | { c?: Document | undefined; a: number }
      >();
      expectTypeOf(omitBy(oOrN, isDateOrString)).toEqualTypeOf<
        {} | { c?: Document | undefined; a: number }
      >();

      expectTypeOf(omitBy(o, isMap)).toEqualTypeOf<{
        2: string;
        a: number;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(oOrU, isMap)).toEqualTypeOf<
        {} | { 2: string; a: number; c: Date | Document }
      >();
      expectTypeOf(omitBy(oOrN, isMap)).toEqualTypeOf<
        {} | { 2: string; a: number; c: Date | Document }
      >();

      expectTypeOf(omitBy(o, isMapOrString)).toEqualTypeOf<{
        a: number;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(oOrU, isMapOrString)).toEqualTypeOf<
        {} | { a: number; c: Date | Document }
      >();
      expectTypeOf(omitBy(oOrN, isMapOrString)).toEqualTypeOf<
        {} | { a: number; c: Date | Document }
      >();

      interface S2 {
        a: 'a' | number;
      }
      const s2 = {} as S2;
      const s2OrU = {} as S2 | undefined;
      const s2OrN = {} as S2 | null;
      expectTypeOf(omitBy(s2, isA)).toEqualTypeOf<{ a?: number | undefined }>();
      expectTypeOf(omitBy(s2OrU, isA)).toEqualTypeOf<
        {} | { a?: number | undefined }
      >();
      expectTypeOf(omitBy(s2OrN, isA)).toEqualTypeOf<
        {} | { a?: number | undefined }
      >();
      expectTypeOf(omitBy(s2, isStringOr2)).toEqualTypeOf<{
        a?: number | undefined;
      }>();
      expectTypeOf(omitBy(s2OrU, isStringOr2)).toEqualTypeOf<
        {} | { a?: number | undefined }
      >();
      expectTypeOf(omitBy(s2OrN, isStringOr2)).toEqualTypeOf<
        {} | { a?: number | undefined }
      >();

      // key narrowing

      interface S {
        a: number;
        b: string;
        c: Date | Document;
      }
      const s = { a: 1, b: '2', c: document } as S;
      const sOrU = s as S | undefined;
      const sOrN = s as S | null;

      expectTypeOf(omitBy(s, keyIsString)).toEqualTypeOf<{}>();
      expectTypeOf(omitBy(sOrU, keyIsString)).toEqualTypeOf<{} | {}>();
      expectTypeOf(omitBy(sOrN, keyIsString)).toEqualTypeOf<{} | {}>();
      expectTypeOf(omitBy(o, keyIsString)).toEqualTypeOf<{}>();
      expectTypeOf(omitBy(oOrU, keyIsString)).toEqualTypeOf<{} | {}>();
      expectTypeOf(omitBy(oOrN, keyIsString)).toEqualTypeOf<{} | {}>();

      expectTypeOf(omitBy(s, keyIsNumber)).toEqualTypeOf<{
        a: number;
        b: string;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(sOrU, keyIsNumber)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(sOrN, keyIsNumber)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(o, keyIsNumber)).toEqualTypeOf<{
        2: string;
        a: number;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsNumber)).toEqualTypeOf<
        {} | { 2: string; a: number; c: Date | Document }
      >();
      expectTypeOf(omitBy(oOrN, keyIsNumber)).toEqualTypeOf<
        {} | { 2: string; a: number; c: Date | Document }
      >();

      expectTypeOf(omitBy(s, keyIsA)).toEqualTypeOf<{
        b: string;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(sOrU, keyIsA)).toEqualTypeOf<
        {} | { b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(sOrN, keyIsA)).toEqualTypeOf<
        {} | { b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(o, keyIsA)).toEqualTypeOf<{
        c: Date | Document;
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsA)).toEqualTypeOf<
        {} | { c: Date | Document; 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsA)).toEqualTypeOf<
        {} | { c: Date | Document; 2?: string | undefined }
      >();

      expectTypeOf(omitBy(s, keyIsString2)).toEqualTypeOf<{
        a: number;
        b: string;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(sOrU, keyIsString2)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(sOrN, keyIsString2)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(o, keyIsString2)).toEqualTypeOf<{
        a: number;
        c: Date | Document;
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsString2)).toEqualTypeOf<
        {} | { a: number; c: Date | Document; 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsString2)).toEqualTypeOf<
        {} | { a: number; c: Date | Document; 2?: string | undefined }
      >();

      expectTypeOf(omitBy(s, keyIsString3)).toEqualTypeOf<{
        a: number;
        b: string;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(sOrU, keyIsString3)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(sOrN, keyIsString3)).toEqualTypeOf<
        {} | { a: number; b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(o, keyIsString3)).toEqualTypeOf<{
        a: number;
        c: Date | Document;
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsString3)).toEqualTypeOf<
        {} | { a: number; c: Date | Document; 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsString3)).toEqualTypeOf<
        {} | { a: number; c: Date | Document; 2?: string | undefined }
      >();

      expectTypeOf(omitBy(s, keyIsC)).toEqualTypeOf<{ a: number; b: string }>();
      expectTypeOf(omitBy(sOrU, keyIsC)).toEqualTypeOf<
        {} | { a: number; b: string }
      >();
      expectTypeOf(omitBy(sOrN, keyIsC)).toEqualTypeOf<
        {} | { a: number; b: string }
      >();
      expectTypeOf(omitBy(o, keyIsC)).toEqualTypeOf<{
        a: number;
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsC)).toEqualTypeOf<
        {} | { a: number; 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsC)).toEqualTypeOf<
        {} | { a: number; 2?: string | undefined }
      >();

      expectTypeOf(omitBy(s, keyIsAorC)).toEqualTypeOf<{ b: string }>();
      expectTypeOf(omitBy(sOrU, keyIsAorC)).toEqualTypeOf<{} | { b: string }>();
      expectTypeOf(omitBy(sOrN, keyIsAorC)).toEqualTypeOf<{} | { b: string }>();
      expectTypeOf(omitBy(o, keyIsAorC)).toEqualTypeOf<{
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsAorC)).toEqualTypeOf<
        {} | { 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsAorC)).toEqualTypeOf<
        {} | { 2?: string | undefined }
      >();

      expectTypeOf(omitBy(s, keyIsAorNumber)).toEqualTypeOf<{
        b: string;
        c: Date | Document;
      }>();
      expectTypeOf(omitBy(sOrU, keyIsAorNumber)).toEqualTypeOf<
        {} | { b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(sOrN, keyIsAorNumber)).toEqualTypeOf<
        {} | { b: string; c: Date | Document }
      >();
      expectTypeOf(omitBy(o, keyIsAorNumber)).toEqualTypeOf<{
        c: Date | Document;
        2?: string | undefined;
      }>();
      expectTypeOf(omitBy(oOrU, keyIsAorNumber)).toEqualTypeOf<
        {} | { c: Date | Document; 2?: string | undefined }
      >();
      expectTypeOf(omitBy(oOrN, keyIsAorNumber)).toEqualTypeOf<
        {} | { c: Date | Document; 2?: string | undefined }
      >();

      const record = {} as Record<string, Date | string>;
      expectTypeOf(omitBy(record, isString)).toEqualTypeOf<
        Record<string, Date | undefined>
      >();
      expectTypeOf(omitBy(record, isNumber)).toEqualTypeOf<
        Record<string, string | Date>
      >();
      expectTypeOf(omitBy(record, isDate)).toEqualTypeOf<
        Record<string, string | undefined>
      >();
      expectTypeOf(omitBy(record, isDateOrString)).toEqualTypeOf<{}>();
      expectTypeOf(omitBy(record, keyIsString)).toEqualTypeOf<{}>();
      expectTypeOf(omitBy(record, keyIsA)).toEqualTypeOf<
        Record<string, string | Date>
      >();
      expectTypeOf(omitBy(record, keyIsNumber)).toEqualTypeOf<
        Record<string, string | Date>
      >();
      expectTypeOf(omitBy(record, keyIsDateOrString)).toEqualTypeOf<{}>();
      expectTypeOf(omitBy(record, () => true)).toEqualTypeOf<
        Record<string, string | Date>
      >();
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    omitBy([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, '0']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    omitBy(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    omitBy(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should create an object with omitted string keyed properties', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 };
    expect(omitBy(object, (_item, key) => key === 'a')).toEqual({
      b: 2,
      c: 3,
      d: 4,
    });
  });
});
