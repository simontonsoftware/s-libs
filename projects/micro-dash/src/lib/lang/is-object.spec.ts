import { isObject } from './is-object';

describe('isObject()', () => {
  function getArguments(): IArguments {
    return arguments;
  }

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should return `true` for objects', () => {
    expect(isObject(getArguments())).toBe(true);
    expect(isObject([1, 2, 3])).toBe(true);
    expect(isObject(Object(false))).toBe(true);
    expect(isObject(new Date())).toBe(true);
    expect(isObject(new Error())).toBe(true);
    expect(isObject(Array.prototype.slice)).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(Object(0))).toBe(true);
    expect(isObject(/x/u)).toBe(true);
    expect(isObject(Object('a'))).toBe(true);
    expect(isObject(document.body)).toBe(true);
    expect(isObject(Object(Symbol('a')))).toBe(true);
  });

  it('should return `false` for non-objects', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject(0)).toBe(false);
    expect(isObject(NaN)).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject('a')).toBe(false);
    expect(isObject(Symbol('a'))).toBe(false);
  });
});
