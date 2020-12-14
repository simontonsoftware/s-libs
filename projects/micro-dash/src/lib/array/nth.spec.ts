import { nth } from './nth';

describe('nth()', () => {
  //
  // stolen from https://github.com/lodash/lodash
  //

  const array = ['a', 'b', 'c', 'd'];

  it('should get the nth element of `array`', () => {
    expect(nth(array, 0)).toBe('a');
    expect(nth(array, 1)).toBe('b');
    expect(nth(array, 2)).toBe('c');
    expect(nth(array, 3)).toBe('d');
  });

  it('should work with a negative `n`', () => {
    expect(nth(array, -1)).toBe('d');
    expect(nth(array, -2)).toBe('c');
    expect(nth(array, -3)).toBe('b');
    expect(nth(array, -4)).toBe('a');
  });

  it('should return `undefined` for empty arrays', () => {
    expect(nth(null, 1)).toBe(undefined);
    expect(nth(undefined, 1)).toBe(undefined);
    expect(nth([], 1)).toBe(undefined);
  });

  it('should return `undefined` for non-indexes', () => {
    expect(nth([1, 2], Infinity)).toBeUndefined();
    expect(nth([1, 2], 2)).toBeUndefined();
  });
});
