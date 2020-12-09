import { isFalsy } from './is-falsy';

describe('isFalsy', () => {
  it('returns `true` for falsy values', () => {
    expect(isFalsy(false)).toBe(true);
    expect(isFalsy(0)).toBe(true);
    expect(isFalsy(-0)).toBe(true);
    // uncomment when targeting ES2020
    // expect(isFalsy(0n)).toBe(true);
    expect(isFalsy('')).toBe(true);
    expect(isFalsy(null)).toBe(true);
    expect(isFalsy(undefined)).toBe(true);
    expect(isFalsy(NaN)).toBe(true);
  });

  // tslint:disable-next-line:only-arrow-functions
  it('returns `false` for truthy values', function (): void {
    expect(isFalsy(arguments)).toBe(false);
    expect(isFalsy([1, 2, 3])).toBe(false);
    expect(isFalsy(true)).toBe(false);
    expect(isFalsy(new Date())).toBe(false);
    expect(isFalsy(new Error())).toBe(false);
    expect(isFalsy(Array.prototype.slice)).toBe(false);
    expect(isFalsy({ a: 1 })).toBe(false);
    expect(isFalsy(1)).toBe(false);
    expect(isFalsy(/x/)).toBe(false);
    expect(isFalsy('a')).toBe(false);
    expect(isFalsy(Symbol('a'))).toBe(false);
  });
});
