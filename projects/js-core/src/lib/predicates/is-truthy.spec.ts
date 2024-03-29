import { getArguments } from '../../test-helpers/test-utils';
import { isTruthy } from './is-truthy';

describe('isTruthy', () => {
  it('returns `true` for truthy values', () => {
    expect(isTruthy(getArguments())).toBe(true);
    expect(isTruthy([1, 2, 3])).toBe(true);
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy(new Date())).toBe(true);
    expect(isTruthy(new Error())).toBe(true);
    expect(isTruthy(Array.prototype.slice)).toBe(true);
    expect(isTruthy({ a: 1 })).toBe(true);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy(/x/u)).toBe(true);
    expect(isTruthy('a')).toBe(true);
    expect(isTruthy(Symbol('a'))).toBe(true);
  });

  it('returns `false` for falsy values', () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy(-0)).toBe(false);
    // uncomment when targeting ES2020
    // expect(isTruthy(0n)).toBe(false);
    expect(isTruthy('')).toBe(false);
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
    expect(isTruthy(NaN)).toBe(false);
  });
});
