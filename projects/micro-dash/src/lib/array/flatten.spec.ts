import { times } from 'lodash-es';
import { flatten } from '.';

describe('flatten()', () => {
  it('can handle large arrays', () => {
    expect(() => {
      flatten(times(1000000, () => [1]));
    }).not.toThrowError();
  });

  //
  // stolen from https://github.com/healthiers/mini-dash
  //

  it('should return empty array', () => {
    expect(flatten([])).toEqual([]);
  });

  it('should flatten uniform length arrays', () => {
    expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
  });

  it('should return different lenth arrays', () => {
    expect(flatten([[1, 2, 3], [4], [5, 6]])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should not modify original array', () => {
    const array = [[1, 2, 3], [4], [5, 6]];

    const flattened = flatten(array);

    expect(flattened).toEqual([1, 2, 3, 4, 5, 6]);
    expect(array).toEqual([[1, 2, 3], [4], [5, 6]]);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should treat sparse arrays as dense', () => {
    const sparse = [4];
    sparse[2] = 6;

    expect(flatten([[1, 2, 3], sparse, Array(2)])).toEqual([
      1,
      2,
      3,
      4,
      undefined,
      6,
      undefined,
      undefined,
    ]);
  });

  it('should work with extremely large arrays', () => {
    const large = Array(5e5);

    expect(flatten([large])).toEqual(large);
  });

  it('should work with empty arrays', () => {
    expect(flatten([[], [[]], [[], [[[]]]]])).toEqual([[], [], [[[]]]]);
  });
});
