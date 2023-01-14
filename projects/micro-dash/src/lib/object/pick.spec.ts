import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { pick } from './pick';

describe('pick()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      const str = '' as string;
      const num = 1 as number;

      interface Obj {
        a: number;
        b: Date;
      }
      const obj = {} as Obj;
      expectTypeOf(pick(obj, 'b')).toEqualTypeOf<{ b: Date }>();

      const objOrNull = {} as Obj | null;
      const objOrUndefined = {} as Obj | undefined;
      const objOrNil = {} as Obj | null | undefined;
      expectTypeOf(pick(objOrNull, 'b')).toEqualTypeOf<{ b: Date } | {}>();
      expectTypeOf(pick(objOrUndefined, 'b')).toEqualTypeOf<{ b: Date } | {}>();
      expectTypeOf(pick(objOrNil, 'b')).toEqualTypeOf<{ b: Date } | {}>();

      interface Indexed {
        [k: string]: number;
        [k: number]: number;
      }
      const indexed = {} as Indexed;
      expectTypeOf(pick(indexed, 'hi')).toEqualTypeOf<{ hi: number }>();
      expectTypeOf(pick(indexed, 5)).toEqualTypeOf<{ 5: number }>();
      expectTypeOf(pick(indexed, 'hi', 5)).toEqualTypeOf<{
        hi: number;
        5: number;
      }>();
      expectTypeOf(pick(indexed, str)).toEqualTypeOf<Record<string, number>>();

      const record = {} as Record<string, number>;
      expectTypeOf(pick(record, str)).toEqualTypeOf<Record<string, number>>();

      interface Composite {
        [k: number]: Date;
        a: 'eh';
        b: 'bee';
      }
      const composite = {} as Composite;
      expectTypeOf(pick(composite, 'a')).toEqualTypeOf<{ a: 'eh' }>();
      expectTypeOf(pick(composite, 'a', 'b')).toEqualTypeOf<{
        a: 'eh';
        b: 'bee';
      }>();
      expectTypeOf(pick(composite, 1)).toEqualTypeOf<{ 1: Date }>();
      expectTypeOf(pick(composite, num)).toEqualTypeOf<Record<number, Date>>();
      expectTypeOf(pick(composite, num, 'a')).toEqualTypeOf<{
        [x: number]: Date;
        a: 'eh';
      }>();
    });
  });

  //
  // stolen from https://github.com/healthiers/mini-dash
  //

  it('should pick single field', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, 'a')).toEqual({ a: 1 });
  });

  it('should pick multiple fields', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, 'a', 'c')).toEqual({ a: 1, c: 3 });
  });

  it('should pick all fields', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, 'a', 'b', 'c')).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('should not mutate original object', () => {
    const object = { a: 1, b: 2, c: 3 };
    pick(object, 'a', 'b');
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should flatten `paths`', () => {
    expect(pick({ a: 1, b: 2, c: 3, d: 4 }, 'a', 'c')).toEqual({ a: 1, c: 3 });
  });

  it('should return an empty object when `object` is nullish', () => {
    expect(pick(null as any, 'valueOf')).toEqual({});
    expect(pick(undefined as any, 'valueOf')).toEqual({});
  });

  it('should work with a primitive `object`', () => {
    expect(pick('', 'slice')).toEqual({ slice: ''.slice });
  });

  it('should create an object of picked string keyed properties', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 };

    expect(pick(object, 'a')).toEqual({ a: 1 });
  });

  it('should work with an array `object`', () => {
    const array = [1, 2, 3];
    expect(pick(array, 1)).toEqual({ 1: 2 });
  });
});
