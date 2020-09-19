import { expectCallsAndReset } from 's-ng-dev-utils';
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
    expect(mapAsKeys(undefined as {} | undefined, iteratee)).toEqual({});
  });

  it('provides the right iteratee arguments', () => {
    const spy = jasmine.createSpy();

    mapAsKeys([1, 2], spy);
    expectCallsAndReset(spy, [1, 0], [2, 1]);

    mapAsKeys({ a: 1, b: 2 }, spy);
    expectCallsAndReset(spy, [1, 'a'], [2, 'b']);
  });
});
