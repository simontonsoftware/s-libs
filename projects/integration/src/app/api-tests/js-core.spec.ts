import {
  assert,
  Constructor,
  convertTime,
  createBuilder,
  Debouncer,
  Deferred,
  elapsedToString,
  getCombinations,
  isDefined,
  isEqualAtDepth,
  isFalsy,
  isPromiseLike,
  isSetEqual,
  isSuperset,
  isTruthy,
  MagicalMap,
  mapAsKeys,
  mapToObject,
  MigrationManager,
  Persistence,
  PublicInterface,
  roundToMultipleOf,
  setDifference,
  setIntersection,
  setUnion,
  sleep,
  sort,
  Stopwatch,
  symmetricSetDifference,
  TimeUnit,
  toCsv,
  wrapFunction,
  wrapMethod,
} from '@s-libs/js-core';
import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';

describe('js-core', () => {
  it('has Constructor', () => {
    const constructor: Constructor<Date> = Date;
    expect(constructor).toBeDefined();
  });

  it('has TimeUnit', () => {
    expect(TimeUnit).toBeDefined();
  });

  it('has Debouncer', () => {
    expect(Debouncer).toBeDefined();
  });

  it('has Deferred', () => {
    expect(Deferred).toBeDefined();
  });

  // Everything was going great until trying to build the bundle. Then it gave not-very-helpful error message, "Do not know how to serialize a BigInt", and the build failed. Last attempted with Angular 15.0.
  // it('has Encoding', () => {
  //   expect(Encoding).toBeDefined();
  // });

  it('has MagicalMap', () => {
    expect(MagicalMap).toBeDefined();
  });

  it('has MigrationManager', () => {
    expect(MigrationManager).toBeDefined();
  });

  it('has Persistence', () => {
    expect(Persistence).toBeDefined();
  });

  it('has PublicInterface', () => {
    staticTest(() => {
      expectTypeOf<PublicInterface<Date>>().toEqualTypeOf<Date>();
    });
  });

  it('has Stopwatch', () => {
    expect(Stopwatch).toBeDefined();
  });

  it('has assert', () => {
    expect(assert).toBeDefined();
  });

  it('has convertTime', () => {
    expect(convertTime).toBeDefined();
  });

  it('has createBuilder', () => {
    expect(createBuilder).toBeDefined();
  });

  it('has elapsedToString', () => {
    expect(elapsedToString).toBeDefined();
  });

  it('has getCombinations', () => {
    expect(getCombinations).toBeDefined();
  });

  it('has isDefined', () => {
    expect(isDefined).toBeDefined();
  });

  it('has isEqualAtDepth', () => {
    expect(isEqualAtDepth).toBeDefined();
  });

  it('has isFalsy', () => {
    expect(isFalsy).toBeDefined();
  });

  it('has isPromiseLike', () => {
    expect(isPromiseLike).toBeDefined();
  });

  it('has isSetEqual', () => {
    expect(isSetEqual).toBeDefined();
  });

  it('has isSuperset', () => {
    expect(isSuperset).toBeDefined();
  });

  it('has isTruthy', () => {
    expect(isTruthy).toBeDefined();
  });

  it('has mapAsKeys', () => {
    expect(mapAsKeys).toBeDefined();
  });

  it('has mapToObject', () => {
    expect(mapToObject).toBeDefined();
  });

  it('has roundToMultipleOf', () => {
    expect(roundToMultipleOf).toBeDefined();
  });

  it('has setDifference', () => {
    expect(setDifference).toBeDefined();
  });

  it('has setIntersection', () => {
    expect(setIntersection).toBeDefined();
  });

  it('has setUnion', () => {
    expect(setUnion).toBeDefined();
  });

  it('has sleep', () => {
    expect(sleep).toBeDefined();
  });

  it('has sort', () => {
    expect(sort).toBeDefined();
  });

  it('has symmetricSetDifference', () => {
    expect(symmetricSetDifference).toBeDefined();
  });

  it('has toCsv', () => {
    expect(toCsv).toBeDefined();
  });

  it('has wrapFunction', () => {
    expect(wrapFunction).toBeDefined();
  });

  it('has wrapMethod', () => {
    expect(wrapMethod).toBeDefined();
  });
});
