import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { zipObject } from './zip-object';

describe('zipObject()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      expectTypeOf(zipObject(['a'], ['yes'])).toEqualTypeOf<
        Record<string, string>
      >();

      expectTypeOf(zipObject(['a'], [1, 'no'])).toEqualTypeOf<
        Record<string, number>
      >();

      expectTypeOf(zipObject([1, 'b'], [1, 'yes'])).toEqualTypeOf<
        Record<number, number> & Record<string, string>
      >();

      expectTypeOf(zipObject([1, 'b'], [1, 2, 'no'])).toEqualTypeOf<
        Record<number, number> & Record<string, number>
      >();

      expectTypeOf(zipObject([1, 'b', 'c'], [1, 2, 'yes'])).toEqualTypeOf<
        Record<number, number> & Record<string, number> & Record<string, string>
      >();

      expectTypeOf(zipObject([1, 'b', 'c'], [1, 2, 3, 'no'])).toEqualTypeOf<
        Record<number, number> & Record<string, number>
      >();

      expectTypeOf(
        zipObject([1, 'b', 'c', 'd'], [1, 2, 3, 'yes']),
      ).toEqualTypeOf<
        Record<number, number> & Record<string, number> & Record<string, string>
      >();

      expectTypeOf(
        zipObject([1, 'b', 'c', 'd'], [1, 2, 3, 4, 'no']),
      ).toEqualTypeOf<Record<number, number> & Record<string, number>>();

      expectTypeOf(zipObject(['a', 'b'] as string[], [1, 2])).toEqualTypeOf<
        Record<string, number | undefined>
      >();
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  const object = { barney: 36, fred: 40 };

  it('should zip together key/value arrays into an object', () => {
    expect(zipObject(['barney', 'fred'], [36, 40])).toEqual(object);
  });

  it('should ignore extra `values`', () => {
    expect(zipObject(['a'], [1, 2])).toEqual({ a: 1 });
  });

  it('should assign `undefined` values for extra `keys`', () => {
    expect(zipObject(['a', 'b'], [1])).toEqual({ a: 1, b: undefined });
  });

  it('should not support deep paths', () => {
    expect(zipObject(['a.b.c'], [1])).toEqual({ 'a.b.c': 1 });
  });
});
