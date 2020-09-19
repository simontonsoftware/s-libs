import { setDifference } from './set-difference';

describe('setDifference()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([3, 4, 5, 6]);
    expect(setDifference(setA, setB)).toEqual(new Set([1, 2]));
  });
});
