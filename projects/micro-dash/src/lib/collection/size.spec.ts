import { size } from './size';

describe('size()', () => {
  //
  // stolen from https://github.com/lodash/lodash
  //

  const array = [1, 2, 3];

  it('should return the number of own enumerable string keyed properties of an object', () => {
    expect(size({ one: 1, two: 2, three: 3 })).toBe(3);
  });

  it('should return the length of an array', () => {
    expect(size(array)).toBe(3);
  });

  it('should accept a falsey `object`', () => {
    expect(size('')).toBe(0);
    expect(size(null)).toBe(0);
    expect(size(undefined)).toBe(0);
  });

  it('should not treat objects with negative lengths as array-like', () => {
    expect(size({ length: -1 })).toBe(1);
  });

  it('should not treat objects with lengths larger than `MAX_SAFE_INTEGER` as array-like', () => {
    const MAX_SAFE_INTEGER = 9007199254740991;
    expect(size({ length: MAX_SAFE_INTEGER + 1 })).toBe(1);
  });

  it('should not treat objects with non-number lengths as array-like', () => {
    expect(size({ length: '0' })).toBe(1);
  });
});
