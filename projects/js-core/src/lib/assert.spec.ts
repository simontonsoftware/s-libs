import { identity, isString } from '@s-libs/micro-dash';
import { staticTest } from '@s-libs/ng-vitest';
import { expectTypeOf } from 'expect-type';
import { getArguments } from '../test-helpers/test-utils';
import { assert } from './assert';

describe('assert()', () => {
  it('throws an error when falsy', () => {
    expect(() => {
      assert(undefined);
    }).toThrow();
    expect(() => {
      assert(null);
    }).toThrow();
    expect(() => {
      assert(false);
    }).toThrow();
    expect(() => {
      assert(0);
    }).toThrow();
    expect(() => {
      assert(NaN);
    }).toThrow();
    expect(() => {
      assert('');
    }).toThrow();
  });

  it('does not throw an error when truthy', () => {
    const args = getArguments(1, 2, 3);

    expect(() => {
      assert(args);
    }).not.toThrow();
    expect(() => {
      assert([1, 2, 3]);
    }).not.toThrow();
    expect(() => {
      assert(true);
    }).not.toThrow();
    expect(() => {
      assert(new Date());
    }).not.toThrow();
    expect(() => {
      assert(new Error());
    }).not.toThrow();
    expect(() => {
      assert(Array.prototype.slice);
    }).not.toThrow();
    expect(() => {
      assert({ a: 1 });
    }).not.toThrow();
    expect(() => {
      assert(1);
    }).not.toThrow();
    expect(() => {
      assert(/x/u);
    }).not.toThrow();
    expect(() => {
      assert('a');
    }).not.toThrow();
    expect(() => {
      assert(Symbol('a'));
    }).not.toThrow();
  });

  it('uses the provided message', () => {
    expect(() => {
      assert(false, 'my message');
    }).toThrow('my message');
    expect(() => {
      assert(true, 'my message');
    }).not.toThrow();
  });

  it('does not require a message', () => {
    expect(() => {
      assert(false);
    }).toThrow('');
    expect(() => {
      assert(true);
    }).not.toThrow();
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const v = '' as Date | string;
      expectTypeOf(identity(v)).toEqualTypeOf<Date | string>();

      assert(isString(v));
      expectTypeOf(identity(v)).toEqualTypeOf<string>();
    });
  });
});
