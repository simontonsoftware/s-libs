import { isSuperset } from './is-superset';

describe('isSuperset()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([3, 4]);
    expect(isSuperset(setA, setB)).toBe(true);
    expect(isSuperset(setB, setA)).toBe(false);
    expect(isSuperset(setA, setA)).toBe(true);
  });
});
