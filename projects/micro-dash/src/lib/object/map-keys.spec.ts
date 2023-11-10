import { expectCallsAndReset, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { identity } from 'lodash-es';
import { EmptyObject } from '../interfaces';
import { mapKeys } from './map-keys';

describe('mapKeys()', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      type A = number[];
      const a = null as unknown as A;
      const aOrN = a as A | null;
      const aOrU = a as A | undefined;

      expectTypeOf(mapKeys(a, String)).toEqualTypeOf<Record<string, number>>();
      expectTypeOf(mapKeys(aOrN, String)).toEqualTypeOf<
        Record<string, number>
      >();
      expectTypeOf(mapKeys(aOrU, String)).toEqualTypeOf<
        Record<string, number>
      >();
      expectTypeOf(mapKeys(a, (_v, k) => k)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(mapKeys(aOrN, (_v, k) => k)).toEqualTypeOf<
        Record<number, number>
      >();
      expectTypeOf(mapKeys(aOrU, (_v, k) => k)).toEqualTypeOf<
        Record<number, number>
      >();

      interface O {
        a: number;
        b: number;
      }
      const o = null as unknown as O;
      const oOrN = o as O | null;
      const oOrU = o as O | undefined;

      expectTypeOf(mapKeys(o, Number)).toEqualTypeOf<Record<number, number>>();
      expectTypeOf(mapKeys(oOrN, Number)).toEqualTypeOf<
        EmptyObject | Record<number, number>
      >();
      expectTypeOf(mapKeys(oOrU, Number)).toEqualTypeOf<
        EmptyObject | Record<number, number>
      >();
      expectTypeOf(mapKeys(o, (_v, k) => k)).toEqualTypeOf<O>();
      expectTypeOf(mapKeys(oOrN, (_v, k) => k)).toEqualTypeOf<
        EmptyObject | O
      >();
      expectTypeOf(mapKeys(oOrU, (_v, k) => k)).toEqualTypeOf<
        EmptyObject | O
      >();
    });
  });

  it('maps strings', () => {
    expect(mapKeys('12', String) as any).toEqual({ 1: '1', 2: '2' });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should map keys in `object` to a new object', () => {
    expect(mapKeys({ a: 1, b: 2 }, String)).toEqual({ 1: 1, 2: 2 });
  });

  it('should treat arrays like objects', () => {
    expect(mapKeys([1, 2], String)).toEqual({ 1: 1, 2: 2 });
  });

  it('should accept a falsey `object`', () => {
    expect(mapKeys(null, identity)).toEqual({});
    expect(mapKeys(undefined, identity)).toEqual({});
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    mapKeys([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, '0']);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    mapKeys(array, spy);

    expectCallsAndReset(spy, [1, '0'], [3, '2']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    mapKeys(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    mapKeys(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
