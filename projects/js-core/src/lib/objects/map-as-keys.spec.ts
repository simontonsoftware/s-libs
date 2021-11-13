import { expectCallsAndReset } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { EmptyObject } from '../interfaces';
import { mapAsKeys } from './map-as-keys';

describe('mapAsKeys()', () => {
  it('works with arrays', () => {
    const result = mapAsKeys([1, 2, 3], (item) => item * item);
    expect(result).toEqual({ 1: 1, 2: 4, 3: 9 });
  });

  it('works with objects', () => {
    const result = mapAsKeys({ a: 'foo', b: 'bar' }, (_item, key) =>
      key.toUpperCase(),
    );
    expect(result).toEqual({ foo: 'A', bar: 'B' });
  });

  it('works with empty and null collections', () => {
    const iteratee = () => 'a';
    expect(mapAsKeys({}, iteratee)).toEqual({});
    expect(mapAsKeys([], iteratee)).toEqual({});
    expect(mapAsKeys(null as [] | null, iteratee)).toEqual({});
    expect(mapAsKeys(undefined as EmptyObject | undefined, iteratee)).toEqual(
      {},
    );
  });

  it('provides the right iteratee arguments', () => {
    const spy = jasmine.createSpy();

    mapAsKeys([1, 2], spy);
    expectCallsAndReset(spy, [1, 0], [2, 1]);

    mapAsKeys({ a: 1, b: 2 }, spy);
    expectCallsAndReset(spy, [1, 'a'], [2, 'b']);
  });

  it('has fancy typing', () => {
    expect().nothing();

    type A = number[];
    type AorU = A | undefined;
    type AorN = A | null;
    const a = [] as A;
    const aOrU = a as AorU;
    const aOrN = a as AorN;
    expectTypeOf(mapAsKeys(a, () => 'a')).toEqualTypeOf<{
      [x: number]: string;
    }>();
    expectTypeOf(mapAsKeys(aOrN, () => 'a')).toEqualTypeOf<
      { [x: number]: string } | EmptyObject
    >();
    expectTypeOf(mapAsKeys(aOrU, () => 'a')).toEqualTypeOf<
      { [x: number]: string } | EmptyObject
    >();

    type B = Array<'a' | 2>;
    type BorU = B | undefined;
    type BorN = B | null;
    const b = [] as B;
    const bOrU = b as BorU;
    const bOrN = b as BorN;
    expectTypeOf(mapAsKeys(b, () => 'a')).toEqualTypeOf<{
      a: string;
      2: string;
    }>();
    expectTypeOf(mapAsKeys(bOrN, () => 0)).toEqualTypeOf<
      { a: number; 2: number } | EmptyObject
    >();
    expectTypeOf(mapAsKeys(bOrU, (): 2 => 2)).toEqualTypeOf<
      { a: 2; 2: 2 } | EmptyObject
    >();

    interface O {
      a: string;
      b: number;
    }
    type OorU = O | undefined;
    type OorN = O | null;
    const o = {} as O;
    const oOrU = o as OorU;
    const oOrN = o as OorN;
    expectTypeOf(mapAsKeys(o, () => true)).toEqualTypeOf<{
      [x: string]: boolean;
      [x: number]: boolean;
    }>();
    expectTypeOf(mapAsKeys(oOrU, () => true)).toEqualTypeOf<
      { [x: string]: boolean; [x: number]: boolean } | EmptyObject
    >();
    expectTypeOf(mapAsKeys(oOrN, () => true)).toEqualTypeOf<
      { [x: string]: boolean; [x: number]: boolean } | EmptyObject
    >();
  });
});
