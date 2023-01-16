import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { getCombinations } from './get-combinations';

describe('getCombinations()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      expectTypeOf(getCombinations([1], 1)).toEqualTypeOf<Array<[number]>>();
      expectTypeOf(getCombinations([1], 2)).toEqualTypeOf<
        Array<[number, number]>
      >();
      expectTypeOf(getCombinations([1], 3)).toEqualTypeOf<
        Array<[number, number, number]>
      >();
      expectTypeOf(getCombinations([1], 4)).toEqualTypeOf<
        Array<[number, number, number, number]>
      >();
      expectTypeOf(getCombinations([1], 5)).toEqualTypeOf<number[][]>();

      getCombinations([] as const, 1);
    });
  });

  it('gets combinations', () => {
    expect(getCombinations([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    expect(getCombinations([1, 2, 3], 2)).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
    expect(getCombinations([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it('gracefully handles length greater than elements', () => {
    expect(getCombinations([1, 2, 3], 4)).toEqual([]);
  });

  it('gracefully handles a fractional length', () => {
    expect(() => {
      getCombinations([1, 2, 3], 1.5);
    }).toThrowError('`length` must be a whole number');
  });
});
