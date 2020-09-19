import { setUnion } from './set-union';

describe('setUnion()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([3, 4, 5, 6]);
    expect(setUnion(setA, setB)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });
});
