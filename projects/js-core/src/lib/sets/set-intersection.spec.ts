import { setIntersection } from './set-intersection';

describe('setIntersection()', () => {
  it('works', () => {
    const setA = new Set([1, 2, 3, 4]);
    const setB = new Set([3, 4, 5, 6]);
    expect(setIntersection(setA, setB)).toEqual(new Set([3, 4]));
  });
});
