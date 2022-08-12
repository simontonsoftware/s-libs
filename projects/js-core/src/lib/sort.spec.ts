import { sort } from './sort';

describe('sort()', () => {
  it('handles nil collections', () => {
    expect(sort(null)).toEqual([]);
    expect(sort(undefined)).toEqual([]);
  });

  it('should sort in ascending order', () => {
    expect(sort([3, 4, 1, 2])).toEqual([1, 2, 3, 4]);
  });

  it('should work with an object for `collection`', () => {
    const actual = sort({ a: 2, b: 3, c: 1 });
    expect(actual).toEqual([1, 2, 3]);
  });
});
