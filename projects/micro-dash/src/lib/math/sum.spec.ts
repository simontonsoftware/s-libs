import { sum } from './sum';

describe('sum()', () => {
  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return the sum of an array of numbers', () => {
    expect(sum([6, 4, 2])).toBe(12);
  });

  it('should return `0` when passing empty `array` values', () => {
    expect(sum([])).toBe(0);
  });

  it('should not skip `NaN` values', () => {
    expect(sum([1, NaN])).toBeNaN();
  });
});
