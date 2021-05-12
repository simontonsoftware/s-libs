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
import { pickBy } from './pick-by';

describe('pickBy()', () => {
  // lodash's test (and behavior) is the opposite
  it('does not treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const logger = jasmine.createSpy();

    pickBy(array, logger);

    expect(logger.calls.allArgs()).toEqual([
      [1, '0'],
      [3, '2'],
    ]);
  });

  // lodash's test for `pick`, but not `pickBy`, even though the behavior is the same
  it('should return an empty object when `object` is nullish', () => {
    expect(pickBy(null, () => true)).toEqual({});
    expect(pickBy(undefined, () => false)).toEqual({});
  });

  it('has fancy typing', () => {
    expect().nothing();

    //
    // Array
    //

    type A = Array<string | number>;
    const a = [1, 'b'] as A;
    const aOrU = [1, 'b'] as A | undefined;
    const aOrN = [1, 'b'] as A | null;

    expectTypeOf(pickBy(a, () => true)).toEqualTypeOf<{
      [index: number]: string | number;
    }>();
    expectTypeOf(pickBy(aOrU, () => true)).toEqualTypeOf<{
      [index: number]: string | number;
    }>();
    expectTypeOf(pickBy(aOrN, () => true)).toEqualTypeOf<{
      [index: number]: string | number;
    }>();

    // narrowing

    expectTypeOf(pickBy(a, isString)).toEqualTypeOf<{
      [index: number]: string;
    }>();
    expectTypeOf(pickBy(aOrU, isString)).toEqualTypeOf<{
      [index: number]: string;
    }>();
    expectTypeOf(pickBy(aOrN, isString)).toEqualTypeOf<{
      [index: number]: string;
    }>();

    expectTypeOf(pickBy(a, isDateOrString)).toEqualTypeOf<{
      [index: number]: string;
    }>();
    expectTypeOf(pickBy(aOrU, isDateOrString)).toEqualTypeOf<{
      [index: number]: string;
    }>();
    expectTypeOf(pickBy(aOrN, isDateOrString)).toEqualTypeOf<{
      [index: number]: string;
    }>();

    expectTypeOf(pickBy(a, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();
    expectTypeOf(pickBy(aOrU, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();
    expectTypeOf(pickBy(aOrN, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();

    type AB = Array<'a' | 'b'>;
    const ab = ['a'] as AB;
    const abOrU = ['a'] as AB | undefined;
    const abOrN = ['a'] as AB | null;
    expectTypeOf(pickBy(ab, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();
    expectTypeOf(pickBy(abOrU, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();
    expectTypeOf(pickBy(abOrN, isA)).toEqualTypeOf<{ [index: number]: 'a' }>();

    type AN = Array<'a' | number>;
    const an = ['a'] as AN;
    const anOrU = ['a'] as AN | undefined;
    const anOrN = ['a'] as AN | null;
    expectTypeOf(pickBy(an, isStringOr2)).toEqualTypeOf<{
      [index: number]: 2 | 'a';
    }>();
    expectTypeOf(pickBy(anOrU, isStringOr2)).toEqualTypeOf<{
      [index: number]: 2 | 'a';
    }>();
    expectTypeOf(pickBy(anOrN, isStringOr2)).toEqualTypeOf<{
      [index: number]: 2 | 'a';
    }>();

    //
    // Object
    //

    interface O {
      a: number;
      2: string;
      c: Date | Document;
    }
    const o: O = {} as any;
    const oOrU: O | undefined = {} as any;
    const oOrN: O | null = {} as any;
    expectTypeOf(pickBy(o, () => true)).toEqualTypeOf<{
      2?: string | undefined;
      a?: number | undefined;
      c?: Date | Document | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, () => true)).toEqualTypeOf<{
      2?: string | undefined;
      a?: number | undefined;
      c?: Date | Document | undefined;
    }>();
    expectTypeOf(pickBy(oOrN, () => true)).toEqualTypeOf<{
      2?: string | undefined;
      a?: number | undefined;
      c?: Date | Document | undefined;
    }>();

    // value narrowing

    expectTypeOf(pickBy(o, isString)).toEqualTypeOf<{ 2: string }>();
    expectTypeOf(pickBy(oOrU, isString)).toEqualTypeOf<{} | { 2: string }>();
    expectTypeOf(pickBy(oOrN, isString)).toEqualTypeOf<{} | { 2: string }>();

    expectTypeOf(pickBy(o, isDate)).toEqualTypeOf<{ c?: Date | undefined }>();
    expectTypeOf(pickBy(oOrU, isDate)).toEqualTypeOf<
      {} | { c?: Date | undefined }
    >();
    expectTypeOf(pickBy(oOrN, isDate)).toEqualTypeOf<
      {} | { c?: Date | undefined }
    >();

    expectTypeOf(pickBy(o, isNumberOrString)).toEqualTypeOf<{
      2: string;
      a: number;
    }>();
    expectTypeOf(pickBy(oOrU, isNumberOrString)).toEqualTypeOf<
      {} | { 2: string; a: number }
    >();
    expectTypeOf(pickBy(oOrN, isNumberOrString)).toEqualTypeOf<
      {} | { 2: string; a: number }
    >();

    expectTypeOf(pickBy(o, isDateOrString)).toEqualTypeOf<{
      2: string;
      c?: Date | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, isDateOrString)).toEqualTypeOf<
      {} | { 2: string; c?: Date | undefined }
    >();
    expectTypeOf(pickBy(oOrN, isDateOrString)).toEqualTypeOf<
      {} | { 2: string; c?: Date | undefined }
    >();

    expectTypeOf(pickBy(o, isMap)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(oOrU, isMap)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(oOrN, isMap)).toEqualTypeOf<{} | {}>();

    expectTypeOf(pickBy(o, isMapOrString)).toEqualTypeOf<{ 2: string }>();
    expectTypeOf(pickBy(oOrU, isMapOrString)).toEqualTypeOf<
      {} | { 2: string }
    >();
    expectTypeOf(pickBy(oOrN, isMapOrString)).toEqualTypeOf<
      {} | { 2: string }
    >();

    interface S2 {
      a: 'a' | number;
    }
    const s2: S2 = {} as any;
    const s2OrU: S2 | undefined = {} as any;
    const s2OrN: S2 | null = {} as any;
    expectTypeOf(pickBy(s2, isA)).toEqualTypeOf<{ a?: 'a' | undefined }>();
    expectTypeOf(pickBy(s2OrU, isA)).toEqualTypeOf<
      {} | { a?: 'a' | undefined }
    >();
    expectTypeOf(pickBy(s2OrN, isA)).toEqualTypeOf<
      {} | { a?: 'a' | undefined }
    >();
    expectTypeOf(pickBy(s2, isStringOr2)).toEqualTypeOf<{
      a?: 2 | 'a' | undefined;
    }>();
    expectTypeOf(pickBy(s2OrU, isStringOr2)).toEqualTypeOf<
      {} | { a?: 2 | 'a' | undefined }
    >();
    expectTypeOf(pickBy(s2OrN, isStringOr2)).toEqualTypeOf<
      {} | { a?: 2 | 'a' | undefined }
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

    expectTypeOf(pickBy(s, keyIsString)).toEqualTypeOf<{
      a: number;
      b: string;
      c: Date | Document;
    }>();
    expectTypeOf(pickBy(sOrU, keyIsString)).toEqualTypeOf<
      {} | { a: number; b: string; c: Date | Document }
    >();
    expectTypeOf(pickBy(sOrN, keyIsString)).toEqualTypeOf<
      {} | { a: number; b: string; c: Date | Document }
    >();
    expectTypeOf(pickBy(o, keyIsString)).toEqualTypeOf<{
      2: string;
      a: number;
      c: Date | Document;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsString)).toEqualTypeOf<
      {} | { 2: string; a: number; c: Date | Document }
    >();
    expectTypeOf(pickBy(oOrN, keyIsString)).toEqualTypeOf<
      {} | { 2: string; a: number; c: Date | Document }
    >();

    expectTypeOf(pickBy(s, keyIsNumber)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(sOrU, keyIsNumber)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(sOrN, keyIsNumber)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(o, keyIsNumber)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(oOrU, keyIsNumber)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(oOrN, keyIsNumber)).toEqualTypeOf<{} | {}>();

    expectTypeOf(pickBy(s, keyIsA)).toEqualTypeOf<{ a: number }>();
    expectTypeOf(pickBy(sOrU, keyIsA)).toEqualTypeOf<{} | { a: number }>();
    expectTypeOf(pickBy(sOrN, keyIsA)).toEqualTypeOf<{} | { a: number }>();
    expectTypeOf(pickBy(o, keyIsA)).toEqualTypeOf<{
      a: number;
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsA)).toEqualTypeOf<
      {} | { a: number; 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsA)).toEqualTypeOf<
      {} | { a: number; 2?: string | undefined }
    >();

    expectTypeOf(pickBy(s, keyIsString2)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(sOrU, keyIsString2)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(sOrN, keyIsString2)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(o, keyIsString2)).toEqualTypeOf<{
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsString2)).toEqualTypeOf<
      {} | { 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsString2)).toEqualTypeOf<
      {} | { 2?: string | undefined }
    >();

    expectTypeOf(pickBy(s, keyIsString3)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(sOrU, keyIsString3)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(sOrN, keyIsString3)).toEqualTypeOf<{} | {}>();
    expectTypeOf(pickBy(o, keyIsString3)).toEqualTypeOf<{
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsString3)).toEqualTypeOf<
      {} | { 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsString3)).toEqualTypeOf<
      {} | { 2?: string | undefined }
    >();

    expectTypeOf(pickBy(s, keyIsC)).toEqualTypeOf<{ c: Date | Document }>();
    expectTypeOf(pickBy(sOrU, keyIsC)).toEqualTypeOf<
      {} | { c: Date | Document }
    >();
    expectTypeOf(pickBy(sOrN, keyIsC)).toEqualTypeOf<
      {} | { c: Date | Document }
    >();
    expectTypeOf(pickBy(o, keyIsC)).toEqualTypeOf<{
      c: Date | Document;
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsC)).toEqualTypeOf<
      {} | { c: Date | Document; 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsC)).toEqualTypeOf<
      {} | { c: Date | Document; 2?: string | undefined }
    >();

    expectTypeOf(pickBy(s, keyIsAorC)).toEqualTypeOf<{
      a: number;
      c: Date | Document;
    }>();
    expectTypeOf(pickBy(sOrU, keyIsAorC)).toEqualTypeOf<
      {} | { a: number; c: Date | Document }
    >();
    expectTypeOf(pickBy(sOrN, keyIsAorC)).toEqualTypeOf<
      {} | { a: number; c: Date | Document }
    >();
    expectTypeOf(pickBy(o, keyIsAorC)).toEqualTypeOf<{
      a: number;
      c: Date | Document;
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsAorC)).toEqualTypeOf<
      {} | { a: number; c: Date | Document; 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsAorC)).toEqualTypeOf<
      {} | { a: number; c: Date | Document; 2?: string | undefined }
    >();

    expectTypeOf(pickBy(s, keyIsAorNumber)).toEqualTypeOf<{ a: number }>();
    expectTypeOf(pickBy(sOrU, keyIsAorNumber)).toEqualTypeOf<
      {} | { a: number }
    >();
    expectTypeOf(pickBy(sOrN, keyIsAorNumber)).toEqualTypeOf<
      {} | { a: number }
    >();
    expectTypeOf(pickBy(o, keyIsAorNumber)).toEqualTypeOf<{
      a: number;
      2?: string | undefined;
    }>();
    expectTypeOf(pickBy(oOrU, keyIsAorNumber)).toEqualTypeOf<
      {} | { a: number; 2?: string | undefined }
    >();
    expectTypeOf(pickBy(oOrN, keyIsAorNumber)).toEqualTypeOf<
      {} | { a: number; 2?: string | undefined }
    >();

    const record: Record<string, number> = {};
    expectTypeOf(pickBy(record, isString)).toEqualTypeOf<{}>();
    // expectTypeOf(pickBy(record, isNumber)).toEqualTypeOf<{
    //   [x: string]: number;
    // }>();
    // expectTypeOf(pickBy(record, keyIsString)).toEqualTypeOf<{
    //   [x: string]: number;
    // }>();
    // expectTypeOf(pickBy(record, keyIsNumber)).toEqualTypeOf<{}>();
    // expectTypeOf(pickBy(record, keyIsDateOrString)).toEqualTypeOf<{
    //   [x: string]: number;
    // }>();
    // expectTypeOf(pickBy(record, keyIsA)).toEqualTypeOf<{ a: number }>();
    // expectTypeOf(pickBy(record, () => true)).toEqualTypeOf<{
    //   [x: string]: number;
    // }>();

    const composite: {
      [k: number]: string | Date;
      a: 'eh';
    } = {} as any;
    expectTypeOf(pickBy(composite, isString)).toEqualTypeOf<{
      [x: number]: string | undefined;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, isNumber)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(composite, isDate)).toEqualTypeOf<{
      [x: number]: Date | undefined;
    }>();
    expectTypeOf(pickBy(composite, isDateOrString)).toEqualTypeOf<{
      [x: number]: string | Date;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, keyIsString)).toEqualTypeOf<{
      [x: number]: string | Date;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, keyIsA)).toEqualTypeOf<{
      [x: number]: string | Date;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, keyIsNumber)).toEqualTypeOf<{}>();
    expectTypeOf(pickBy(composite, keyIsAorC)).toEqualTypeOf<{
      [x: number]: string | Date;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, keyIsAorNumber)).toEqualTypeOf<{
      [x: number]: string | Date;
      a: 'eh';
    }>();
    expectTypeOf(pickBy(composite, () => true)).toEqualTypeOf<{
      [x: number]: string | Date;
      a?: 'eh' | undefined;
    }>();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    pickBy([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, '0']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    pickBy(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    pickBy(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should work with a predicate argument', () => {
    expect(
      pickBy({ a: 1, b: 2, c: 3, d: 4 }, (n) => n === 1 || n === 3),
    ).toEqual({ a: 1, c: 3 });
  });

  it('should create an object of picked string keyed properties', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 };

    expect(pickBy(object, (_item, key) => key === 'a')).toEqual({ a: 1 });
  });

  it('should work with an array `object`', () => {
    const array = [1, 2, 3];
    expect(pickBy(array, (_item, key) => key === '1')).toEqual({ 1: 2 });
  });
});
