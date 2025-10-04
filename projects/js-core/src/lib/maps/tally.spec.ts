import { Tally } from './tally';

describe('Tally', () => {
  describe('.add()', () => {
    it('adds to the tally', () => {
      const tally = new Tally<string>();
      tally.add('alice');
      expect(tally.get('alice')).toBe(1);
      tally.add('alice', 4);
      expect(tally.get('alice')).toBe(5);
    });
  });

  describe('.get()', () => {
    it('gets the tally, defaulting to 0', () => {
      const tally = new Tally<string>();
      expect(tally.get('bob')).toBe(0);
      tally.add('bob', 3);
      expect(tally.get('bob')).toBe(3);
    });
  });

  describe('.keys()', () => {
    it('gets the keys', () => {
      const tally = new Tally<string>();
      tally.add('alice');
      tally.add('bob', 2);
      expect([...tally.keys()]).toEqual(['alice', 'bob']);
    });
  });

  describe('.entries()', () => {
    it('gets the entries', () => {
      const tally = new Tally<string>();
      tally.add('alice');
      tally.add('bob', 2);
      expect([...tally.entries()]).toEqual([
        ['alice', 1],
        ['bob', 2],
      ]);
    });
  });
});
