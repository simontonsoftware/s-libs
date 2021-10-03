import { expectTypeOf } from 'expect-type';
import { property } from './property';

describe('property()', () => {
  it('has fancy typing', () => {
    expect().nothing();

    interface O {
      a: number;
      b: Array<{ c: 3 }>;
      d?: { e: Date };
    }

    const obj: O = {
      a: 1,
      b: [{ c: 3 }],
    };
    expectTypeOf(property(['a'])(obj)).toEqualTypeOf<number>();
    expectTypeOf(property(['b'])(obj)).toEqualTypeOf<Array<{ c: 3 }>>();
    expectTypeOf(property(['b', 0])(obj)).toEqualTypeOf<{ c: 3 }>();
    expectTypeOf(property(['b', 0, 'c'])(obj)).toEqualTypeOf<3>();

    expectTypeOf(property(['d'])(obj)).toEqualTypeOf<{ e: Date } | undefined>();
    const blah = property(['d', 'e'])(obj);
    expectTypeOf(blah).toEqualTypeOf<Date | undefined>();

    const oOrN = obj as O | null;
    const blah2 = property(['a'])(oOrN);
    expectTypeOf(blah2).toEqualTypeOf<number | undefined>();

    expectTypeOf(property(['a'])(undefined)).toEqualTypeOf<undefined>();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should create a function that plucks a property value of a given object', () => {
    const object = { a: 1 };
    const prop = property(['a']);
    expect(prop.length).toBe(1);
    expect(prop(object)).toBe(1);
  });

  it('should pluck deep property values', () => {
    expect(property(['a', 'b'])({ a: { b: 2 } })).toBe(2);
  });

  it('should work with a non-string `path`', () => {
    expect(property([1])([1, 2, 3])).toBe(2);
  });

  it('should return `undefined` when `object` is nullish', () => {
    expect(property(['constructor'])(null)).toBe(undefined);
    expect(property(['constructor'])(undefined)).toBe(undefined);
  });

  it('should return `undefined` for deep paths when `object` is nullish', () => {
    expect(property(['constructor', 'prototype', 'valueOf'])(null)).toBe(
      undefined,
    );
    expect(property(['constructor', 'prototype', 'valueOf'])(undefined)).toBe(
      undefined,
    );
  });

  it('should return `undefined` if parts of `path` are missing', () => {
    expect(property(['a'])({})).toBe(undefined);
    expect(property(['a', '1', 'b', 'c'])({})).toBe(undefined);
  });
});
