import { symmetricSetDifference } from './symmetric-set-difference';

describe('symmetricSetDifference()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([3, 4, 5, 6]);
    expect(symmetricSetDifference(setA, setB)).toEqual(new Set([1, 2, 5, 6]));
  });
});
