import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { Nil } from '../interfaces';
import { invoke } from './invoke';

describe('invoke()', () => {
  it('sets the context correctly when only 1 deep', () => {
    const spy = jasmine.createSpy();
    const obj = { a: spy };

    invoke(obj, ['a']);

    expect(spy.calls.first().object).toBe(obj);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      //
      // empty path
      //

      expectTypeOf(invoke({ a: () => 1 }, [])).toEqualTypeOf<undefined>();
      expectTypeOf(
        invoke({} as { a: () => string } | undefined, []),
      ).toEqualTypeOf<undefined>();

      //
      // 1 element path
      //

      expectTypeOf(invoke({ a: () => 1 }, ['a'])).toEqualTypeOf<number>();
      expectTypeOf(
        invoke({ a: (a: boolean) => a }, ['a'], true),
      ).toEqualTypeOf<boolean>();
      expectTypeOf(invoke({} as { a?: () => string }, ['a'])).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(
        invoke({} as Nil | { a: () => string }, ['a']),
      ).toEqualTypeOf<string | undefined>();

      //
      // 2 element path
      //

      expectTypeOf(
        invoke({ a: { b: () => 1 } }, ['a', 'b']),
      ).toEqualTypeOf<number>();
      expectTypeOf(
        invoke({ a: { b: (a: boolean) => a } }, ['a', 'b'], true),
      ).toEqualTypeOf<boolean>();
      expectTypeOf(
        invoke({} as { a: { b?: () => string } }, ['a', 'b']),
      ).toEqualTypeOf<string | undefined>();
      expectTypeOf(
        invoke({} as { a?: { b: () => string } }, ['a', 'b']),
      ).toEqualTypeOf<string | undefined>();
      expectTypeOf(
        invoke({} as Nil | { a: { b: () => string } }, ['a', 'b']),
      ).toEqualTypeOf<string | undefined>();

      //
      // 3 element path
      //

      const path3: ['a', 'b', 'c'] = ['a', 'b', 'c'];
      expectTypeOf(
        invoke({ a: { b: { c: () => 1 } } }, path3),
      ).toEqualTypeOf<number>();
      expectTypeOf(
        invoke({ a: { b: { c: (a: boolean) => a } } }, path3, true),
      ).toEqualTypeOf<boolean>();
      expectTypeOf(
        invoke({} as { a: { b: { c?: () => string } } }, path3),
      ).toEqualTypeOf<string | undefined>();
      expectTypeOf(
        invoke({} as { a: { b?: { c: () => string } } }, path3),
      ).toEqualTypeOf<string | undefined>();
      expectTypeOf(
        invoke({} as { a?: { b: { c: () => string } } }, path3),
      ).toEqualTypeOf<string | undefined>();
      expectTypeOf(
        invoke({} as Nil | { a: { b: { c: () => string } } }, path3),
      ).toEqualTypeOf<string | undefined>();

      // //
      // // 4 element path
      // //
      //
      // const path4: ["a", "b", "c", "d"] = ["a", "b", "c", "d"];
      // // $ExpectType number
      // invoke({ a: { b: { c: { d: () => 1 } } } }, path4);
      // // $ExpectType boolean
      // invoke({ a: { b: { c: { d: (a: boolean) => a } } } }, path4, true);
      // // $ExpectType string | undefined
      // invoke({} as { a: { b: { c: { d?: () => string } } } }, path4);
      // // $ExpectType string | undefined
      // invoke({} as { a: { b: { c?: { d: () => string } } } }, path4);
      // // $ExpectType string | undefined
      // invoke({} as { a: { b?: { c: { d: () => string } } } }, path4);
      // // $ExpectType string | undefined
      // invoke({} as { a?: { b: { c: { d: () => string } } } }, path4);
      // // $ExpectType string | undefined
      // invoke({} as { a: { b: { c: { d: () => string } } } } | Nil, path4);

      //
      // fallback: n element path
      //

      const pathN: string[] = ['a'];
      // $ExpectType any
      invoke({ a: () => 1 }, pathN);
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should invoke a method on `object`', () => {
    expect(invoke({ a: () => 'A' }, ['a'])).toBe('A');
  });

  it('should support invoking with arguments', () => {
    const obj = { a: (a: any, b: any): any[] => [a, b] };
    expect(invoke(obj, ['a'], 1, 2)).toEqual([1, 2]);
  });

  it('should not error on nullish elements', () => {
    expect(invoke(null, ['a', 'b'], 1, 2)).toBeUndefined();
    expect(invoke(undefined, ['a', 'b'], 1, 2)).toBeUndefined();
  });

  it('should support deep paths', () => {
    const obj = { a: { b: (a: any, b: any): any[] => [a, b] } };
    expect(invoke(obj, ['a', 'b'], 1, 2)).toEqual([1, 2]);
  });

  it('should invoke deep property methods with the correct `this` binding', () => {
    const obj = {
      a: {
        b(): number {
          return this.c;
        },
        c: 1,
      },
    };
    expect(invoke(obj, ['a', 'b'])).toBe(1);
  });
});
