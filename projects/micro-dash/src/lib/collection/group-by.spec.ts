import { expectTypeOf } from 'expect-type';
import { identity } from 'lodash-es';
import { expectCallsAndReset, staticTest } from '@s-libs/ng-dev';
import { groupBy } from './group-by';

describe('groupBy()', () => {
  it('works with an `undefined` collection', () => {
    expect(groupBy(undefined, identity)).toEqual({});
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const a = [1] as number[];
      const aOrN = [1] as number[] | null;
      const o = { a: 1 } as { a: number };
      const oOrU = { a: 1 } as { a: number } | undefined;

      expectTypeOf(groupBy(a, (): string => 'hi')).toEqualTypeOf<
        Record<string, number[]>
      >();
      expectTypeOf(groupBy(a, (): 'hi' | 'there' => 'hi')).toEqualTypeOf<{
        hi: number[] | undefined;
        there: number[] | undefined;
      }>();
      expectTypeOf(groupBy(o, (): number => 1)).toEqualTypeOf<
        Record<number, number[]>
      >();
      expectTypeOf(groupBy(o, (): 1 | 2 => 1)).toEqualTypeOf<{
        1: number[] | undefined;
        2: number[] | undefined;
      }>();

      expectTypeOf(groupBy(aOrN, (): string => 'a')).toEqualTypeOf<
        Record<string, number[]>
      >();
      expectTypeOf(groupBy(oOrU, (): string => 'a')).toEqualTypeOf<
        Record<string, number[]>
      >();
    });
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should transform keys by `iteratee`', () => {
    expect(groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({
      4: [4.2],
      6: [6.1, 6.3],
    });
  });

  it('should only add values to own, not inherited, properties', () => {
    const actual = groupBy([6.1, 4.2, 6.3], (n) =>
      Math.floor(n) > 4 ? 'hasOwnProperty' : 'constructor',
    );

    expect(actual.constructor).toEqual([4.2]);
    expect(actual.hasOwnProperty).toEqual([6.1, 6.3]);
  });

  it('should work with an object for `collection`', () => {
    expect(groupBy({ a: 6.1, b: 4.2, c: 6.3 }, Math.floor)).toEqual({
      4: [4.2],
      6: [6.1, 6.3],
    });
  });

  it('should provide correct iteratee arguments', () => {
    const spy = jasmine.createSpy();
    groupBy([1, 2, 3], spy);
    expect(spy.calls.first().args).toEqual([1]);
  });

  it('should treat sparse arrays as dense', () => {
    const array = [1];
    array[2] = 3;
    const spy = jasmine.createSpy().and.returnValue(true);

    groupBy(array, spy);

    expectCallsAndReset(spy, [1], [undefined], [3]);
  });

  it('should not iterate custom properties of arrays', () => {
    const array = [1];
    (array as any).a = 1;
    const spy = jasmine.createSpy().and.returnValue(true);

    groupBy(array, spy);

    expectCallsAndReset(spy, [1]);
  });

  it('iterates over own string keyed properties of objects', () => {
    const object = { a: 1 };
    const spy = jasmine.createSpy().and.returnValue(true);

    groupBy(object, spy);

    expectCallsAndReset(spy, [1]);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    groupBy(array, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    groupBy(object, spy);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
