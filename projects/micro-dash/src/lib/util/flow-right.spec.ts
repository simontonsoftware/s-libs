import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { curry, head, identity } from 'lodash';
import { flowRight } from './flow-right';

describe('flowRight()', () => {
  const two = (): number => 2;
  const add = (x: number, y: number): number => x + y;
  const square = (x: number): number => x * x;
  const fixed = (n: number): string => n.toFixed(1);

  it('has fancy typing', () => {
    staticTest(() => {
      // chaining
      const s = (): string => '';
      const s2s = (_: string): string => '';
      const s2n = (_: string): number => 0;
      const n2d = (_: number): Date => new Date();
      expectTypeOf(flowRight()).toEqualTypeOf<<T>(a: T) => T>();
      expectTypeOf(flowRight(two)).toEqualTypeOf<() => number>();
      expectTypeOf(flowRight(s2s)).toEqualTypeOf<(a: string) => string>();
      expectTypeOf(flowRight(s2n, s)).toEqualTypeOf<() => number>();
      expectTypeOf(flowRight(n2d, s2n)).toEqualTypeOf<(a: string) => Date>();

      // passing in an array of fns
      const gen: ReadonlyArray<(_: string) => string> = [];
      expectTypeOf(flowRight(...gen)).toEqualTypeOf<(a: string) => string>();

      // errors (mismatched types when chaining)
      expectTypeOf(flowRight(n2d, s)).toEqualTypeOf<never>();
    });
  });

  it('works with 0-arg last function', () => {
    expect(flowRight(square, two)()).toBe(4);
  });

  it('works with one function', () => {
    expect(flowRight(two)()).toBe(2);
    expect(flowRight(add)(1, 2)).toBe(3);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should supply each function with the return value of the previous', () => {
    expect(flowRight(fixed, square, add)(1, 2)).toBe('9.0');
  });

  it('should return an identity function when no arguments are given', () => {
    expect(flowRight()('a')).toBe('a');
  });

  it('should work with a curried function and `_.head`', () => {
    const curried: any = curry(identity);
    const combined: any = flowRight(head as any, curried);

    expect(combined([1])).toBe(1);
  });
});
