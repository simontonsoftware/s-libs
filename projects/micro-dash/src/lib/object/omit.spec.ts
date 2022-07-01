import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { EmptyObject } from '../interfaces';
import { omit } from './';

describe('omit()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      const str = '' as string;
      const num = 0 as number;

      interface Obj {
        a: number;
        b: Date;
      }
      const obj = {} as Obj;
      const objOrN = {} as Obj | null;
      const objOrU = {} as Obj | undefined;
      expectTypeOf(omit(obj, 'b')).toEqualTypeOf<{ a: number }>();
      expectTypeOf(omit(objOrN, 'b')).toEqualTypeOf<
        { a: number } | EmptyObject
      >();
      expectTypeOf(omit(objOrU, 'b')).toEqualTypeOf<
        { a: number } | EmptyObject
      >();

      const indexed = {} as { [k: string]: number; [k: number]: number };
      expectTypeOf(omit(indexed, 'hi')).toEqualTypeOf<{
        [x: string]: number;
        [x: number]: number;
      }>();
      expectTypeOf(omit(indexed, 5)).toEqualTypeOf<{
        [x: string]: number;
        [x: number]: number;
      }>();
      expectTypeOf(omit(indexed, 'hi', 5)).toEqualTypeOf<{
        [x: string]: number;
        [x: number]: number;
      }>();
      expectTypeOf(omit(indexed, str)).toEqualTypeOf<{
        [x: string]: number;
        [x: number]: number;
      }>();

      const record = {} as Record<string, number>;
      expectTypeOf(omit(record, str)).toEqualTypeOf<Record<string, number>>();

      const composite = {} as { [k: number]: Date; a: 'eh'; b: 'bee' };
      expectTypeOf(omit(composite, 'a')).toEqualTypeOf<{
        [x: number]: Date;
        b: 'bee';
      }>();
      expectTypeOf(omit(composite, 'a', 'b')).toEqualTypeOf<
        Record<number, Date>
      >();
      expectTypeOf(omit(composite, 1)).toEqualTypeOf<{
        [x: number]: Date;
        a: 'eh';
        b: 'bee';
      }>();
      expectTypeOf(omit(composite, num)).toEqualTypeOf<{
        [x: number]: Date;
        a: 'eh';
        b: 'bee';
      }>();
      expectTypeOf(omit(composite, num, 'a')).toEqualTypeOf<{
        [x: number]: Date;
        b: 'bee';
      }>();
    });
  });

  //
  // stolen from https://github.com/healthiers/mini-dash
  //

  it('should omit single field', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, 'a')).toEqual({ b: 2, c: 3 });
  });

  it('should omit multiple fields', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, 'a', 'c')).toEqual({ b: 2 });
  });

  it('should omit all fields', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, 'a', 'b', 'c')).toEqual({});
  });

  it('should not mutate original object', () => {
    const object = { a: 1, b: 2, c: 3 };
    expect(omit(object, 'a', 'b')).toEqual({ c: 3 });
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should flatten `paths`', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 };
    expect(omit(object, 'a', 'c')).toEqual({ b: 2, d: 4 });
  });

  it('should return an empty object when `object` is nullish', () => {
    expect(omit<any, any>(null, 'valueOf')).toEqual({});
    expect(omit<any, any>(undefined, 'valueOf')).toEqual({});
  });

  it('should not mutate `object`', () => {
    const object = { a: { b: 2 } };
    omit(object, 'a');
    expect(object).toEqual({ a: { b: 2 } });
  });

  it('should create an object with omitted string keyed properties', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 };
    expect(omit(object, 'a')).toEqual({ b: 2, c: 3, d: 4 });
  });
});
