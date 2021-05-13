import { getArguments } from '../../test-helpers/test-utils';
import { isPromiseLike } from './is-promise-like';

describe('isPromiseLike()', () => {
  it('works', () => {
    expect(isPromiseLike(Promise.resolve('hi'))).toBe(true);
    expect(isPromiseLike(Promise.reject('bye'))).toBe(true);

    // falsey values
    expect(isPromiseLike(undefined)).toBe(false);
    expect(isPromiseLike(null)).toBe(false);
    expect(isPromiseLike(false)).toBe(false);
    expect(isPromiseLike(0)).toBe(false);
    expect(isPromiseLike(NaN)).toBe(false);
    expect(isPromiseLike('')).toBe(false);

    // all the other things
    expect(isPromiseLike(getArguments())).toBe(false);
    expect(isPromiseLike([1, 2, 3])).toBe(false);
    expect(isPromiseLike(true)).toBe(false);
    expect(isPromiseLike(new Date())).toBe(false);
    expect(isPromiseLike(new Error())).toBe(false);
    expect(isPromiseLike(Array.prototype.slice)).toBe(false);
    expect(isPromiseLike({ a: 1 })).toBe(false);
    expect(isPromiseLike(1)).toBe(false);
    expect(isPromiseLike(/x/)).toBe(false);
    expect(isPromiseLike('a')).toBe(false);
    expect(isPromiseLike(Symbol('a'))).toBe(false);
  });
});
