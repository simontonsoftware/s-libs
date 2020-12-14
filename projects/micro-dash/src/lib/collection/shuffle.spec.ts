import { sortBy, times, uniqBy } from 'lodash-es';
import { shuffle } from './shuffle';

describe('shuffle()', () => {
  it('accepts nil values for the collection, returning an empty array', () => {
    expect(shuffle(null)).toEqual([]);
    expect(shuffle(undefined)).toEqual([]);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  const array = [1, 2, 3];
  const object = { a: 1, b: 2, c: 3 };

  it('should return a new array', () => {
    const actual = shuffle(array);
    expect(actual).toEqual(jasmine.arrayWithExactContents(array));
    expect(actual).not.toBe(array);
  });

  it('should contain the same elements after a collection is shuffled', () => {
    expect(shuffle(array).sort()).toEqual(array);
    expect(shuffle(object).sort()).toEqual(array);
  });

  it('should shuffle small collections', () => {
    const actual = times(1000, () => shuffle([1, 2]));
    expect(sortBy(uniqBy(actual, String), '0')).toEqual([
      [1, 2],
      [2, 1],
    ]);
  });
});
