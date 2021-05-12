import { expectTypeOf } from 'expect-type';
import { identity } from '../util';
import { reduceRight } from './reduce-right';

describe('reduceRight()', () => {
  it('works with `undefined`', () => {
    expect(reduceRight(undefined, () => 1, 2)).toEqual(2);
    expect(reduceRight(undefined as any, () => 1)).toBeUndefined();
  });

  it('works with `null`', () => {
    expect(reduceRight(null, () => 1, 2)).toEqual(2);
    expect(reduceRight(null as any, () => 1)).toBeUndefined();
  });

  it('has fancy typing', () => {
    expect().nothing();

    type Ary = Array<string | number>;
    type Obj = { a: string; b: number };

    const a: Ary = [] as any;
    const aOrNull: Ary | null = [] as any;
    const aOrUndefined: Ary | undefined = [] as any;
    const aOrNullOrUndefined: Ary | null | undefined = [] as any;
    const o: Obj = {} as any;
    const oOrNull: Obj | null = {} as any;
    const oOrUndefined: Obj | undefined = {} as any;
    const oOrNullOrUndefined: Obj | null | undefined = {} as any;

    expectTypeOf(reduceRight(a, identity)).toEqualTypeOf<string | number>();
    expectTypeOf(reduceRight(aOrNull, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(aOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(aOrNullOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(a, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduceRight(aOrNull, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(
      reduceRight(aOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();
    expectTypeOf(
      reduceRight(aOrNullOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();

    expectTypeOf(reduceRight(o, identity)).toEqualTypeOf<string | number>();
    expectTypeOf(reduceRight(oOrNull, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(oOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(oOrNullOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduceRight(o, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduceRight(oOrNull, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(
      reduceRight(oOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();
    expectTypeOf(
      reduceRight(oOrNullOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();

    reduceRight(a, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return 1;
    });
    reduceRight(aOrNull, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return 1;
    });
    reduceRight(
      a,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<number>();
        return accumulator;
      },
      new Date(),
    );
    reduceRight(
      aOrNull,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<number>();
        return accumulator;
      },
      new Date(),
    );

    reduceRight(o, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
      return 1;
    });
    reduceRight(oOrNull, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
      return 1;
    });
    reduceRight(
      o,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
        return accumulator;
      },
      new Date(),
    );
    reduceRight(
      oOrNull,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
        return accumulator;
      },
      new Date(),
    );
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should use the last element as the `accumulator`', () => {
    expect(reduceRight([1, 2, 3], identity)).toEqual(3);
  });

  it('should provide correct `iteratee` arguments for an array', () => {
    const logger = jasmine.createSpy().and.returnValue(7);
    reduceRight([1, 2, 3], logger, 0);
    expect(logger.calls.allArgs()).toEqual([
      [0, 3, 2],
      [7, 2, 1],
      [7, 1, 0],
    ]);

    logger.calls.reset();
    reduceRight([1, 2, 3], logger);
    expect(logger.calls.allArgs()).toEqual([
      [3, 2, 1],
      [7, 1, 0],
    ]);
  });

  it('should provide correct `iteratee` arguments for an object', () => {
    const logger = jasmine.createSpy().and.returnValue(7);
    reduceRight({ a: 1, b: 2 }, logger, 0);
    expect(logger.calls.allArgs()).toEqual([
      [0, 2, 'b'],
      [7, 1, 'a'],
    ]);

    logger.calls.reset();
    reduceRight({ a: 1, b: 2 }, logger);
    expect(logger.calls.allArgs()).toEqual([[2, 1, 'a']]);
  });
});
