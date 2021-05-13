import { getArguments } from '../../test-helpers/test-utils';
import { isDefined } from './is-defined';

describe('isDefined()', () => {
  it('works', () => {
    // falsey values
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(NaN)).toBe(true);
    expect(isDefined('')).toBe(true);

    // all the other things
    expect(isDefined(getArguments())).toBe(true);
    expect(isDefined([1, 2, 3])).toBe(true);
    expect(isDefined(true)).toBe(true);
    expect(isDefined(new Date())).toBe(true);
    expect(isDefined(new Error())).toBe(true);
    expect(isDefined(Array.prototype.slice)).toBe(true);
    expect(isDefined({ a: 1 })).toBe(true);
    expect(isDefined(1)).toBe(true);
    expect(isDefined(/x/)).toBe(true);
    expect(isDefined('a')).toBe(true);
    expect(isDefined(Symbol('a'))).toBe(true);
  });
});
