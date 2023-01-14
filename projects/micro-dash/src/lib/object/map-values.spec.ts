import { expectCallsAndReset } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { identity } from '../util';
import { mapKeys } from './map-keys';
import { mapValues } from './map-values';

describe('mapValues()', () => {
  it('has fancy typing', () => {
    expect().nothing();

    type A = number[];
    const a = null as unknown as A;
    const aOrN = a as A | null;
    const aOrU = a as A | undefined;

    expectTypeOf(mapValues(a, String)).toEqualTypeOf<Record<number, string>>();
    expectTypeOf(mapValues(aOrN, String)).toEqualTypeOf<
      Record<number, string>
    >();
    expectTypeOf(mapValues(aOrU, String)).toEqualTypeOf<
      Record<number, string>
    >();
    expectTypeOf(mapValues(a, identity)).toEqualTypeOf<
      Record<number, number>
    >();
    expectTypeOf(mapValues(aOrN, identity)).toEqualTypeOf<
      Record<number, number>
    >();
    expectTypeOf(mapValues(aOrU, identity)).toEqualTypeOf<
      Record<number, number>
    >();

    interface O {
      a: number;
      b: number;
    }
    const o = null as unknown as O;
    const oOrN = o as O | null;
    const oOrU = o as O | undefined;

    expectTypeOf(mapValues(o, String)).toEqualTypeOf<{
      a: string;
      b: string;
    }>();
    expectTypeOf(mapValues(oOrN, String)).toEqualTypeOf<
      { a: string; b: string } | {}
    >();
    expectTypeOf(mapValues(oOrU, String)).toEqualTypeOf<
      { a: string; b: string } | {}
    >();
    expectTypeOf(mapValues(o, identity)).toEqualTypeOf<O>();
    expectTypeOf(mapValues(oOrN, identity)).toEqualTypeOf<O | {}>();
    expectTypeOf(mapValues(oOrU, identity)).toEqualTypeOf<O | {}>();
  });

  it('maps strings', () => {
    expect(mapValues('ab', String) as any).toEqual({ 0: 'a', 1: 'b' });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should map values in `object` to a new object', () => {
    expect(mapValues({ a: 1, b: 2 }, String)).toEqual({ a: '1', b: '2' });
  });

  it('should treat arrays like objects', () => {
    expect(mapValues([1, 2], String)).toEqual({ 0: '1', 1: '2' });
  });

  it('should accept a falsey `object`', () => {
    expect(mapKeys(null, identity)).toEqual({});
    expect(mapKeys(undefined, identity)).toEqual({});
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    mapValues([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1, '0']);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy();

    mapValues(array, spy);

    expectCallsAndReset(spy, [1, '0'], [3, '2']);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    mapValues(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    mapValues(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
