import { constant, range, times } from 'lodash-es';
import { intersection } from './intersection';

describe('intersection()', () => {
  it('works with null and undefined', () => {
    const array = [0, 1, null, 3];
    expect(intersection(array, null)).toEqual([]);
    expect(intersection(array, undefined)).toEqual([]);
    expect(intersection(null, array)).toEqual([]);
    expect(intersection(undefined, array)).toEqual([]);
    expect(intersection(null)).toEqual([]);
    expect(intersection(undefined)).toEqual([]);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return the intersection of two arrays', () => {
    expect(intersection([2, 1], [2, 3])).toEqual([2]);
  });

  it('should return the intersection of multiple arrays', () => {
    expect(intersection([2, 1, 2, 3], [3, 4], [3, 2])).toEqual([3]);
  });

  it('should return an array of unique values', () => {
    expect(intersection([1, 1, 3, 2, 2], [5, 2, 2, 1, 4], [2, 1, 1])).toEqual([
      1, 2,
    ]);
  });

  it('should work with a single array', () => {
    expect(intersection([1, 1, 3, 2, 2])).toEqual([1, 3, 2]);
  });

  it('should match `NaN`', () => {
    expect(intersection([1, NaN, 3], [NaN, 5, NaN])).toEqual([NaN]);
  });

  it('should work with large arrays of `NaN`', () => {
    const largeArray = times(200, () => NaN);
    expect(intersection([1, NaN, 3], largeArray)).toEqual([NaN]);
  });

  it('should work with large arrays of objects', () => {
    const object = {};
    const largeArray = times(200, constant(object));

    expect(intersection([object], largeArray)).toEqual([object]);
    expect(intersection(range(200), [1])).toEqual([1]);
  });

  it('should return an array', () => {
    const array = [1, 2, 3];
    const actual = intersection(array);

    expect(actual).toEqual(jasmine.any(Array));
    expect(actual).not.toBe(array);
  });
});
