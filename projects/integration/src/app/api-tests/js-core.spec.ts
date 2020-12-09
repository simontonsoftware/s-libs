import * as jsCore from '@s-libs/js-core';
import {
  assert,
  Constructor,
  convertTime,
  createBuilder,
  Debouncer,
  Deferred,
  elapsedToString,
  isDefined,
  isEqualAtDepth,
  isFalsy,
  isPromiseLike,
  isSetEqual,
  isSuperset,
  mapAsKeys,
  mapToObject,
  MigrationManager,
  Persistence,
  roundToMultipleOf,
  setDifference,
  setIntersection,
  setUnion,
  sleep,
  symmetricSetDifference,
  TimeUnit,
  toCsv,
  wrapFunction,
  wrapMethod,
} from '@s-libs/js-core';
import { keys } from '@s-libs/micro-dash';

describe('js-core', () => {
  describe('public API', () => {
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

    it('has MigrationManager', () => {
      expect(MigrationManager).toBeDefined();
    });

    it('has Persistence', () => {
      expect(Persistence).toBeDefined();
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

  describe('as a UMD bundle', () => {
    const bundle: typeof jsCore = (window as any).sLibs.jsCore;

    it('is available as a UMD bundle at sLibs.jsCore', () => {
      expect(keys(bundle)).toEqual(
        jasmine.arrayWithExactContents(keys(jsCore)),
      );
    });

    it('knows where to find micro-dash', () => {
      const result = bundle.mapToObject([1, 2, 3], (item) => [
        item,
        item * item,
      ]);
      expect(result).toEqual({ 1: 1, 2: 4, 3: 9 });
    });
  });
});
