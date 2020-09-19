import { isEqualAtDepth } from './is-equal-at-depth';

function expectToBecomeEqualAtDepth(
  depth: number,
  value: any,
  other: any,
): void {
  let i = 0;
  for (; i < depth; ++i) {
    expect(isEqualAtDepth(i, value, other)).toBe(false);
  }
  expect(isEqualAtDepth(i++, value, other)).toBe(true);
  expect(isEqualAtDepth(i++, value, other)).toBe(true);
}

function expectNeverEqual(value: any, other: any): void {
  for (let i = 0; i < 3; ++i) {
    expect(isEqualAtDepth(i, value, other)).toBe(false);
  }
}

describe('isEqualAtDepth()', () => {
  it('considers nested object equal if they are the same object', () => {
    const item = { b: [2, 3] };
    const object1 = { item };
    const object2 = { item };

    expectToBecomeEqualAtDepth(1, object1, object2);
  });

  it('is is correct for the example in issues/4', () => {
    expectNeverEqual({ a: 1, b: [2] }, { a: 3, b: [2] });
  });

  //
  // modified tests from `isEqual` of micro-dash
  //

  it('should compare primitives', () => {
    const symbol1 = Symbol('a');
    const symbol2 = Symbol('b');

    for (let depth = 0; depth < 3; ++depth) {
      expect(isEqualAtDepth(depth, 1, 1)).toBe(true);
      expect(isEqualAtDepth(depth, 1, '1')).toBe(false);
      expect(isEqualAtDepth(depth, 1, 2)).toBe(false);
      expect(isEqualAtDepth(depth, -0, -0)).toBe(true);
      expect(isEqualAtDepth(depth, 0, 0)).toBe(true);
      expect(isEqualAtDepth(depth, 0, '0')).toBe(false);
      expect(isEqualAtDepth(depth, 0, null)).toBe(false);
      expect(isEqualAtDepth(depth, NaN, NaN)).toBe(true);
      expect(isEqualAtDepth(depth, NaN, 'a')).toBe(false);
      expect(isEqualAtDepth(depth, NaN, Infinity)).toBe(false);
      expect(isEqualAtDepth(depth, 'a', 'a')).toBe(true);
      expect(isEqualAtDepth(depth, 'a', 'b')).toBe(false);
      expect(isEqualAtDepth(depth, 'a', ['a'])).toBe(false);
      expect(isEqualAtDepth(depth, true, true)).toBe(true);
      expect(isEqualAtDepth(depth, true, 1)).toBe(false);
      expect(isEqualAtDepth(depth, true, 'a')).toBe(false);
      expect(isEqualAtDepth(depth, false, false)).toBe(true);
      expect(isEqualAtDepth(depth, false, 0)).toBe(false);
      expect(isEqualAtDepth(depth, false, '')).toBe(false);
      expect(isEqualAtDepth(depth, symbol1, symbol1)).toBe(true);
      expect(isEqualAtDepth(depth, symbol1, symbol2)).toBe(false);
      expect(isEqualAtDepth(depth, null, null)).toBe(true);
      expect(isEqualAtDepth(depth, null, undefined)).toBe(false);
      expect(isEqualAtDepth(depth, null, {})).toBe(false);
      expect(isEqualAtDepth(depth, null, '')).toBe(false);
      expect(isEqualAtDepth(depth, undefined, undefined)).toBe(true);
      expect(isEqualAtDepth(depth, undefined, null)).toBe(false);
      expect(isEqualAtDepth(depth, undefined, '')).toBe(false);
    }
  });

  it('should compare arrays', () => {
    let array1: any[] = [true, null, 1, 'a', undefined];
    let array2: any[] = [true, null, 1, 'a', undefined];
    expectToBecomeEqualAtDepth(1, array1, array2);

    array1 = [[1, 2, 3], new Date(2012, 4, 23), /x/, { e: 1 }];
    array2 = [[1, 2, 3], new Date(2012, 4, 23), /x/, { e: 1 }];
    expectToBecomeEqualAtDepth(2, array1, array2);

    array1 = [1, 2, 3];
    array2 = [3, 2, 1];
    expectNeverEqual(array1, array2);

    array1 = [1, 2];
    array2 = [1, 2, 3];
    expectNeverEqual(array1, array2);
  });

  it('should compare plain objects', () => {
    let object1: object = { a: true, b: null, c: 1, d: 'a', e: undefined };
    let object2: object = { a: true, b: null, c: 1, d: 'a', e: undefined };
    expectToBecomeEqualAtDepth(1, object1, object2);

    object1 = { a: [1, 2, 3], d: { e: 1 } };
    object2 = { a: [1, 2, 3], d: { e: 1 } };
    expectToBecomeEqualAtDepth(2, object1, object2);

    object1 = { a: 1, b: 2, c: 3 };
    object2 = { a: 3, b: 2, c: 1 };
    expectNeverEqual(object1, object2);

    object1 = { a: 1, b: 2, c: 3 };
    object2 = { d: 1, e: 2, f: 3 };
    expectNeverEqual(object1, object2);

    object1 = { a: 1, b: 2 };
    object2 = { a: 1, b: 2, c: 3 };
    expectNeverEqual(object1, object2);
  });

  it('should compare objects regardless of key order', () => {
    const object1 = { a: 1, b: 2, c: 3 };
    const object2 = { c: 3, a: 1, b: 2 };
    expectToBecomeEqualAtDepth(1, object1, object2);
  });

  it('should compare nested objects', () => {
    const object1 = {
      a: [1, 2, 3],
      b: true,
      d: 'a',
      e: { f: ['a', 'c'], j: 'a' },
    };
    const object2 = {
      a: [1, 2, 3],
      b: true,
      d: 'a',
      e: { f: ['a', 'c'], j: 'a' },
    };
    expectToBecomeEqualAtDepth(3, object1, object2);
  });

  it('should compare objects with constructor properties', () => {
    expectToBecomeEqualAtDepth(1, { constructor: 1 }, { constructor: 1 });
    expectNeverEqual({ constructor: 1 }, { constructor: '1' });
    expectToBecomeEqualAtDepth(2, { constructor: [1] }, { constructor: [1] });
    expectNeverEqual({ constructor: [1] }, { constructor: ['1'] });
    expectNeverEqual({ constructor: Object }, {});
  });

  it('should compare objects with shared property values', () => {
    const object1: any = { a: [1, 2] };
    const object2 = { a: [1, 2], b: [1, 2] };
    object1.b = object1.a;

    expectToBecomeEqualAtDepth(2, object1, object2);
  });

  it('should avoid common type coercions', () => {
    expectNeverEqual(0, '');
    expectNeverEqual(1, true);
    expectNeverEqual(1337756400000, new Date(2012, 4, 23));
    expectNeverEqual('36', 36);
    expectNeverEqual(36, '36');
  });

  it('is `false` for objects with custom `toString` methods', () => {
    let primitive: any;
    const object = {
      toString(): any {
        return primitive;
      },
    };

    for (const value of [true, null, 1, 'a', undefined]) {
      primitive = value;
      expectNeverEqual(object, value);
    }
  });
});
