import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { curry, head, identity } from 'lodash';
import { flow } from './flow';

describe('flow()', () => {
  const increment = (x: number): number => x + 1;
  const fixed = (n: number): string => n.toFixed(1);
  const two = (): number => 2;
  const square = (n: number): number => n * n;

  it('works with 0-arg first function', () => {
    expect(flow(two, square)()).toBe(4);
  });

  it('works with one function', () => {
    expect(flow(two)()).toBe(2);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      // chaining
      const s = (): string => '';
      const s2s = (_: string): string => '';
      const s2n = (_: string): number => 0;
      const n2d = (_: number): Date => new Date();
      expectTypeOf(flow()).toEqualTypeOf<<T>(a: T) => T>();
      expectTypeOf(flow(s)).toEqualTypeOf<() => string>();
      expectTypeOf(flow(s2s)).toEqualTypeOf<(a: string) => string>();
      expectTypeOf(flow(s2n, n2d)).toEqualTypeOf<(a: string) => Date>();

      // passing in an array of fns
      const gen: ReadonlyArray<(_: string) => string> = [];
      expectTypeOf(flow(...gen)).toEqualTypeOf<(a: string) => string>();

      // @ts-expect-error mismatched output->input
      flow(s, n2d);
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should supply each function with the return value of the previous', () => {
    expect(flow(increment, square, fixed)(2)).toBe('9.0');
  });

  it('should return an identity function when no arguments are given', () => {
    expect(flow()('a')).toBe('a');
  });

  it('should work with a curried function and `_.head`', () => {
    const curried: any = curry(identity);
    const combined: any = flow(head as any, curried);
    expect(combined([1])).toBe(1);
  });
});
