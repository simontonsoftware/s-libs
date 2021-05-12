import { expectTypeOf } from 'expect-type';
import { identity } from '../util';
import { reduce } from './reduce';

describe('reduce()', () => {
  it('works with `undefined`', () => {
    expect(reduce(undefined, () => 1, 2)).toEqual(2);
    expect(reduce(undefined as any, () => 1)).toBeUndefined();
  });

  it('works with `null`', () => {
    expect(reduce(null, () => 1, 2)).toEqual(2);
    expect(reduce(null as any, () => 1)).toBeUndefined();
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

    expectTypeOf(reduce(a, identity)).toEqualTypeOf<string | number>();
    expectTypeOf(reduce(aOrNull, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(aOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(aOrNullOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(a, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduce(aOrNull, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduce(aOrUndefined, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(
      reduce(aOrNullOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();

    expectTypeOf(reduce(o, identity)).toEqualTypeOf<string | number>();
    expectTypeOf(reduce(oOrNull, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(oOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(oOrNullOrUndefined, identity)).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(reduce(o, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduce(oOrNull, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(reduce(oOrUndefined, identity, 4)).toEqualTypeOf<number>();
    expectTypeOf(
      reduce(oOrNullOrUndefined, identity, 4),
    ).toEqualTypeOf<number>();

    reduce(a, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return 1;
    });
    reduce(aOrNull, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return 1;
    });
    reduce(
      a,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<number>();
        return accumulator;
      },
      new Date(),
    );
    reduce(
      aOrNull,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<number>();
        return accumulator;
      },
      new Date(),
    );

    reduce(o, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
      return 1;
    });
    reduce(oOrNull, (accumulator, value, index) => {
      expectTypeOf(accumulator).toEqualTypeOf<string | number>();
      expectTypeOf(value).toEqualTypeOf<string | number>();
      expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
      return 1;
    });
    reduce(
      o,
      (accumulator, value, index) => {
        expectTypeOf(accumulator).toEqualTypeOf<Date>();
        expectTypeOf(value).toEqualTypeOf<string | number>();
        expectTypeOf(index).toEqualTypeOf<'a' | 'b'>();
        return accumulator;
      },
      new Date(),
    );
    reduce(
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

  it('should use the first element as the `accumulator`', () => {
    expect(reduce([1, 2, 3], identity)).toEqual(1);
  });

  it('should provide correct `iteratee` arguments for an array', () => {
    const logger = jasmine.createSpy().and.returnValue(7);
    reduce([1, 2, 3], logger, 0);
    expect(logger.calls.allArgs()).toEqual([
      [0, 1, 0],
      [7, 2, 1],
      [7, 3, 2],
    ]);

    logger.calls.reset();
    reduce([1, 2, 3], logger);
    expect(logger.calls.allArgs()).toEqual([
      [1, 2, 1],
      [7, 3, 2],
    ]);
  });

  it('should provide correct `iteratee` arguments for an object', () => {
    const logger = jasmine.createSpy().and.returnValue(7);
    reduce({ a: 1, b: 2 }, logger, 0);
    expect(logger.calls.allArgs()).toEqual([
      [0, 1, 'a'],
      [7, 2, 'b'],
    ]);

    logger.calls.reset();
    reduce({ a: 1, b: 2 }, logger);
    expect(logger.calls.allArgs()).toEqual([[1, 2, 'b']]);
  });

  it('should ignore changes to `length`', () => {
    const array = [1];
    const spy = jasmine.createSpy().and.callFake(() => {
      array.push(2);
      return true;
    });

    reduce(array, spy, array);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore added `object` properties', () => {
    const object: any = { a: 1 };
    const spy = jasmine.createSpy().and.callFake(() => {
      object.b = 2;
      return true;
    });

    reduce(object, spy, object);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
