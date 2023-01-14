import { expectCallsAndReset } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { mapToObject } from './map-to-object';

describe('mapToObject()', () => {
  it('works with arrays', () => {
    const result = mapToObject([1, 2, 3], (item) => [item, item * item]);
    expect(result).toEqual({ 1: 1, 2: 4, 3: 9 });
  });

  it('works with objects', () => {
    const result = mapToObject({ a: 'foo', b: 'bar' }, (item, key) => [
      item,
      key.toUpperCase(),
    ]);
    expect(result).toEqual({ foo: 'A', bar: 'B' });
  });

  it('works with empty and null collections', () => {
    function iteratee(): ['a', 1] {
      return ['a', 1];
    }
    expect(mapToObject({}, iteratee)).toEqual({});
    expect(mapToObject([], iteratee)).toEqual({});
    expect(mapToObject(null, iteratee)).toEqual({});
    expect(mapToObject(undefined, iteratee)).toEqual({});
  });

  it('provides the right iteratee arguments', () => {
    const spy = jasmine.createSpy().and.returnValue(['a', 1]);

    mapToObject([1, 2], spy);
    expectCallsAndReset(spy, [1, 0], [2, 1]);

    mapToObject({ a: 1, b: 2 }, spy);
    expectCallsAndReset(spy, [1, 'a'], [2, 'b']);
  });

  describe('typing', () => {
    it('is good for arrays', () => {
      expect().nothing();

      type A = number[];
      type AorU = A | undefined;
      type AorN = A | null;

      const a = [] as A;
      const aOrU = a as AorU;
      const aOrN = a as AorN;

      interface Result {
        a?: number;
      }
      expectTypeOf(mapToObject(a, () => ['a', 1])).toEqualTypeOf<Result>();
      expectTypeOf(mapToObject(aOrN, () => ['a', 1])).toEqualTypeOf<Result>();
      expectTypeOf(mapToObject(aOrU, () => ['a', 1])).toEqualTypeOf<Result>();

      const index: [string, number] = ['a', 1];
      type IndexResult = Record<string, number>;
      expectTypeOf(mapToObject(a, () => index)).toEqualTypeOf<IndexResult>();
      expectTypeOf(mapToObject(aOrU, () => index)).toEqualTypeOf<IndexResult>();
      expectTypeOf(mapToObject(aOrN, () => index)).toEqualTypeOf<IndexResult>();
    });

    it('is good for objects', () => {
      expect().nothing();

      interface O {
        a: string;
        b: number;
      }
      type OorU = O | undefined;
      type OorN = O | null;

      const o = {} as O;
      const oOrU = o as OorU;
      const oOrN = o as OorN;

      interface Result {
        a?: number;
      }
      expectTypeOf(mapToObject(o, () => ['a', 1])).toEqualTypeOf<Result>();
      expectTypeOf(mapToObject(oOrU, () => ['a', 1])).toEqualTypeOf<Result>();
      expectTypeOf(mapToObject(oOrN, () => ['a', 1])).toEqualTypeOf<Result>();

      const index: [string, number] = ['a', 1];
      type IndexResult = Record<string, number>;
      expectTypeOf(mapToObject(o, () => index)).toEqualTypeOf<IndexResult>();
      expectTypeOf(mapToObject(oOrU, () => index)).toEqualTypeOf<IndexResult>();
      expectTypeOf(mapToObject(oOrN, () => index)).toEqualTypeOf<IndexResult>();
    });
  });
});
