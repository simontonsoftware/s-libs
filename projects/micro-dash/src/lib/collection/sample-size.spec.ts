import { difference } from 'lodash-es';
import { sampleSize } from './sample-size';

describe('sampleSize()', () => {
  const array = [1, 2, 3];

  it('should return an array of random elements', () => {
    const actual = sampleSize(array, 2);
    expect(actual.length).toBe(2);
    expect(difference(actual, array)).toEqual([]);
  });

  it('should contain elements of the collection', () => {
    expect(sampleSize(array, array.length).sort()).toEqual(array);
  });

  it('should treat falsey `size` values, except `undefined`, as `0`', () => {
    expect(sampleSize(['a'], 0)).toEqual([]);
    expect(sampleSize(['a'])).toEqual(['a']);
    expect(sampleSize(['a'], undefined)).toEqual(['a']);
  });

  it('should return an empty array when `n` < `1` or `NaN`', () => {
    expect(sampleSize(array, 0)).toEqual([]);
    expect(sampleSize(array, -1)).toEqual([]);
    expect(sampleSize(array, -Infinity)).toEqual([]);
  });

  it('should return all elements when `n` >= `length`', () => {
    expect(sampleSize(array, 3).sort()).toEqual(array);
    expect(sampleSize(array, 4).sort()).toEqual(array);
    expect(sampleSize(array, 2 ** 32).sort()).toEqual(array);
    expect(sampleSize(array, Infinity).sort()).toEqual(array);
  });

  it('should return an empty array for empty collections', () => {
    expect(sampleSize([], 1)).toEqual([]);
    expect(sampleSize({}, 1)).toEqual([]);
    expect(sampleSize(null, 1)).toEqual([]);
    expect(sampleSize(undefined, 1)).toEqual([]);
  });

  it('should sample an object', () => {
    const object = { a: 1, b: 2, c: 3 };
    const actual = sampleSize(object, 2);
    expect(actual.length).toBe(2);
    expect(difference(actual, array)).toEqual([]);
  });
});
