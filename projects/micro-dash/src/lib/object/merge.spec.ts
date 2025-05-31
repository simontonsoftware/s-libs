import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { merge } from './';

describe('merge()', () => {
  it('only clones as much as it needs to', () => {
    const o1 = { a: { b: 2 }, c: { d: 4 } };
    const o2 = { a: { b: -2 } };
    const origC = o1.c;

    expect(merge(o1, o2).c).toBe(origC);
    expect(merge(o2, o1).c).toBe(origC);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      // simple properties
      expectTypeOf(merge({ a: 1 })).toEqualTypeOf<{ a: number }>();
      expectTypeOf(merge({ a: 1 }, { b: '2' })).toEqualTypeOf<
        { a: number } & { b: string }
      >();
      expectTypeOf(merge({}, { a: 1 }, { b: '2' })).toEqualTypeOf<
        { a: number } & { b: string }
      >();

      // deep merging
      expectTypeOf(
        merge({ a: { b: 1 } }, { a: { c: 2 } }),
      ).branded.toEqualTypeOf<{
        a: { b: number; c: number };
      }>();

      // passing in array
      interface Elem {
        a: number;
        b: { c: string };
      }
      const elem = {} as Elem;
      const partE = {} as Partial<Elem>;
      expectTypeOf(merge(elem, ...([] as Elem[]))).toEqualTypeOf<Elem>();
      expectTypeOf(merge(partE, ...([] as Array<Partial<Elem>>))).toEqualTypeOf<
        Partial<Elem>
      >();

      // @ts-expect-error don't allow mutating type of `a`
      merge({ a: 1 }, { a: 'b' });
      // @ts-expect-error don't allow mutating type of nestest `b`
      merge({ a: { b: 1 } }, { a: { b: 'b' } });
      // @ts-expect-error require objects
      merge(1);
      // @ts-expect-error require objects
      merge(null);
      // @ts-expect-error require objects
      merge(undefined);
      // @ts-expect-error require objects
      merge({ a: 1 }, 2);
    });
  });

  //
  // stolen from https://github.com/healthiers/mini-dash
  //

  it('should return empty object when single empty object given', () => {
    expect(merge({})).toEqual({});
  });

  it('should return empty object when multiple empty objects given', () => {
    expect(merge({}, {}, {})).toEqual({});
  });

  it('should return the union of 2 properties', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('should return the union of 3 properties', () => {
    expect(merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should have the rightmost property', () => {
    expect(merge({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 });
  });

  it('should mutate (only) the first input', () => {
    const first: { a: number; b?: number; c?: number } = { a: 1 };
    const second = { b: 2 };
    const third = { c: 3 };

    expect(merge(first, second, third)).toEqual({ a: 1, b: 2, c: 3 });

    expect(first).toEqual({ a: 1, b: 2, c: 3 });
    expect(second).toEqual({ b: 2 });
    expect(third).toEqual({ c: 3 });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should throw strict mode errors', () => {
    const object = Object.freeze({ a: 1 });
    expect(() => {
      merge(object, { a: 1 });
    }).toThrowError(/^Cannot assign to read only property/u);
  });

  it('should merge `source` into `object`', () => {
    const names = {
      characters: [{ name: 'barney' }, { name: 'fred' }],
    };
    const ages = {
      characters: [{ age: 36 }, { age: 40 }],
    };
    const heights = {
      characters: [{ height: '5\'4"' }, { height: '5\'5"' }],
    };
    const expected = {
      characters: [
        { name: 'barney', age: 36, height: '5\'4"' },
        { name: 'fred', age: 40, height: '5\'5"' },
      ],
    };

    expect(merge(names, ages, heights)).toEqual(expected);
  });

  it('should work with four arguments', () => {
    expect(merge({ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 })).toEqual({ a: 4 });
  });

  it('should assign `null` values', () => {
    const obj: { a: number | null } = { a: 1 };
    expect(merge(obj, { a: null })).toEqual({ a: null });
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;

    const actual = merge([] as number[], array);

    expect('1' in actual).toBeTruthy();
    expect(actual as any).toEqual([1, undefined, 3]);
  });

  it('should not augment source objects', () => {
    let source1: any = { a: [{ a: 1 }] };
    let source2: any = { a: [{ b: 2 }] };
    let actual: any = merge({}, source1, source2);
    expect(source1.a).toEqual([{ a: 1 }]);
    expect(source2.a).toEqual([{ b: 2 }]);
    expect(actual.a).toEqual([{ a: 1, b: 2 }]);

    source1 = { a: [[1, 2, 3]] };
    source2 = { a: [[3, 4]] };
    actual = merge({}, source1, source2);
    expect(source1.a).toEqual([[1, 2, 3]]);
    expect(source2.a).toEqual([[3, 4]]);
    expect(actual.a).toEqual([[3, 4, 3]]);
  });
});
