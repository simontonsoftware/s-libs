import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { MagicalMap } from './magical-map';

describe('MagicalMap', () => {
  describe('.set()', () => {
    it('sets', () => {
      const map = new MagicalMap<number, number>(() => 0);
      map.set(1, 2);
      expect(map.get(1)).toBe(2);
    });
  });

  describe('.get()', () => {
    it('gets values that are in the map', () => {
      const map = new MagicalMap<number, number>(() => 0);
      map.set(1, 2);
      expect(map.get(1)).toBe(2);
    });

    it('creates values that are not in the map', () => {
      const map = new MagicalMap<number, number>(() => 57);
      expect(map.get(1)).toBe(57);
    });

    it('passes `key` to the creation hook', () => {
      const create = jasmine.createSpy();
      const map = new MagicalMap<number, number>(create);

      map.get(12);

      expectSingleCallAndReset(create, 12);
    });

    it('does not call creation hook for a value that already exsits', () => {
      const create = jasmine.createSpy();
      const map = new MagicalMap<number, number>(create);

      map.set(12, 5);
      map.get(12);

      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('.keys()', () => {
    it('gets the keys', () => {
      const map = new MagicalMap<number, number>(() => 0);
      map.set(1, 2);
      map.get(-2);
      expect([...map.keys()]).toEqual([1, -2]);
    });
  });

  describe('.values()', () => {
    it('gets the values', () => {
      const map = new MagicalMap<number, number>(() => 0);
      map.set(1, 2);
      map.get(-2);
      expect([...map.values()]).toEqual([2, 0]);
    });
  });

  describe('.entries()', () => {
    it('gets the entries', () => {
      const map = new MagicalMap<number, number>(() => 0);
      map.set(1, 2);
      map.get(-2);
      expect([...map.entries()]).toEqual([
        [1, 2],
        [-2, 0],
      ]);
    });
  });
});
