import { isSetEqual } from './is-set-equal';

describe('isSetEqual()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3]);
    const empty = new Set([]);

    expect(isSetEqual(setA, new Set([3, 4, 5]))).toBe(false);
    expect(isSetEqual(setA, setA)).toBe(true);
    expect(isSetEqual(setA, new Set([1, 2, 3]))).toBe(true);
    expect(isSetEqual(setA, new Set([3, 2, 1]))).toBe(true);
    expect(isSetEqual(setA, empty)).toBe(false);

    expect(isSetEqual(empty, empty)).toBe(true);
    expect(isSetEqual(empty, new Set([]))).toBe(true);
  });
});
