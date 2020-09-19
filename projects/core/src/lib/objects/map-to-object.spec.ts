import { expectCallsAndReset } from 's-ng-dev-utils';
import { mapToObject } from './map-to-object';

describe('mapToObject()', () => {
  it('works with arrays', () => {
    const result = mapToObject([1, 2, 3], (item) => [item, item * item]);
    expect(result).toEqual({ 1: 1, 2: 4, 3: 9 });
  });

  it('works with objects', () => {
    const result = mapToObject({ a: 'foo', b: 'bar' }, (item, key) => [
      item,
      key.toUpperCase(),
    ]);
    expect(result).toEqual({ foo: 'A', bar: 'B' });
  });

  it('works with empty and null collections', () => {
    const iteratee = () => ['a', 1] as const;
    expect(mapToObject({}, iteratee)).toEqual({});
    expect(mapToObject([], iteratee)).toEqual({});
    expect(mapToObject(null, iteratee)).toEqual({});
    expect(mapToObject(undefined, iteratee)).toEqual({});
  });

  it('provides the right iteratee arguments', () => {
    const spy = jasmine.createSpy().and.returnValue(['a', 1]);

    mapToObject([1, 2], spy);
    expectCallsAndReset(spy, [1, 0], [2, 1]);

    mapToObject({ a: 1, b: 2 }, spy);
    expectCallsAndReset(spy, [1, 'a'], [2, 'b']);
  });
});
