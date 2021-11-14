import { expectTypeOf } from 'expect-type';
import { keys } from './keys';

describe('keys()', () => {
  it('makes no special accommodations for `arguments` objects (unlike lodash)', function () {
    expect(keys(arguments).sort()).toEqual(['callee', 'length']);
  });

  it('includes the `constructor` property on prototype objects (unlike lodash)', () => {
    function Foo(): void {
      // blah
    }
    Foo.prototype.a = 1;

    expect(keys(Foo.prototype)).toEqual(['constructor', 'a']);
  });

  it('has fancy typing', () => {
    expect().nothing();

    interface O {
      a: number;
      b: number;
    }
    interface W {
      a: number;
      2: string;
    }
    type A = number[];
    const oOrU = undefined as undefined | O;
    const oOrN = null as null | O;
    const wOrU = undefined as undefined | W;
    const wOrN = null as null | W;
    const aOrU = undefined as undefined | A;
    const aOrN = null as null | A;

    expectTypeOf(keys({ a: 1, b: 2 })).toEqualTypeOf<('a' | 'b')[]>();
    expectTypeOf(keys(oOrU)).toEqualTypeOf<('a' | 'b')[]>();
    expectTypeOf(keys(oOrN)).toEqualTypeOf<('a' | 'b')[]>();
    expectTypeOf(keys({ a: 2, 2: 'b' })).toEqualTypeOf<string[]>();
    expectTypeOf(keys(wOrU)).toEqualTypeOf<string[]>();
    expectTypeOf(keys(wOrN)).toEqualTypeOf<string[]>();
    expectTypeOf(keys([1, 2])).toEqualTypeOf<string[]>();
    expectTypeOf(keys(aOrU)).toEqualTypeOf<string[]>();
    expectTypeOf(keys(aOrN)).toEqualTypeOf<string[]>();

    expectTypeOf(keys(['a', 'b'])).toEqualTypeOf<string[]>();
    expectTypeOf(keys({ a: 1, b: 'hi ' })).toEqualTypeOf<('a' | 'b')[]>();
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return the string keyed property names of `object`', () => {
    expect(keys({ a: 1, b: 1 }).sort()).toEqual(['a', 'b']);
  });

  it('should not include inherited string keyed properties', () => {
    function Foo(this: any): void {
      this.a = 1;
    }
    Foo.prototype.b = 2;

    expect(keys(new (Foo as any)()).sort()).toEqual(['a']);
  });

  it('should return keys for custom properties on arrays', () => {
    const array = [1];
    (array as any).a = 1;

    expect(keys(array).sort()).toEqual(['0', 'a']);
  });

  it('should not include inherited string keyed properties of arrays', () => {
    (Array.prototype as any).a = 1;
    expect(keys([1]).sort()).toEqual(['0']);
    delete (Array.prototype as any).a;
  });

  it('should return keys for custom properties on `arguments` objects', () => {
    const args: any = (function (..._: any[]): IArguments {
      return arguments;
    })(1, 2, 3);
    args.a = 1;
    expect(keys(args).sort()).toEqual(['0', '1', '2', 'a', 'callee', 'length']);
  });

  it('should not include inherited string keyed properties of `arguments` objects', () => {
    (Object.prototype as any).a = 1;
    const args: any = (function (..._: any[]): IArguments {
      return arguments;
    })(1, 2, 3);

    expect(keys(args).sort()).toEqual(['0', '1', '2', 'callee', 'length']);

    delete (Object.prototype as any).a;
  });

  it('should work with string objects', () => {
    expect(keys(Object('abc')).sort()).toEqual(['0', '1', '2', 'length']);
  });

  it('should return keys for custom properties on string objects', () => {
    const object = Object('a');
    object.a = 1;

    expect(keys(object).sort()).toEqual(['0', 'a', 'length']);
  });

  it('should not include inherited string keyed properties of string objects', () => {
    (String.prototype as any).a = 1;
    expect(keys(Object('a')).sort()).toEqual(['0', 'length']);
    delete (String.prototype as any).a;
  });

  it('should work with array-like objects', () => {
    expect(keys({ '0': 'a', length: 1 }).sort()).toEqual(['0', 'length']);
  });

  it('should return an empty array when `object` is nullish', () => {
    expect(keys(null)).toEqual([]);
    expect(keys(undefined)).toEqual([]);
  });
});
