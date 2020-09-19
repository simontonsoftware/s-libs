import { Persistence } from './persistence';

describe('Persistence', () => {
  const key = 'my key';
  beforeEach(() => {
    localStorage.removeItem(key);
  });
  afterEach(() => {
    localStorage.removeItem(key);
  });

  it('works for the example in the docs', () => {
    // if 'my key' has never been used before
    const persistence = new Persistence('my key');
    expect(persistence.get()).toBeUndefined();

    // now you set it
    persistence.put({ name: 'Robert' });

    // this will work even after the app reloads (e.g. the next week)
    expect(persistence.get()).toEqual({ name: 'Robert' });
  });

  describe('.put() & .get()', () => {
    it('can work with primitives', () => {
      const value = 42;
      const persistence = new Persistence<typeof value>(key);
      persistence.put(value);
      expect(persistence.get()).toEqual(value);
    });

    it('can work with objects', () => {
      const value = { a: 1, b: { c: 'hi' } };
      const persistence = new Persistence<typeof value>(key);
      persistence.put(value);
      expect(persistence.get()).toEqual(value);
    });

    it('can work with arrays', () => {
      const value = [42, { a: 1 }];
      const persistence = new Persistence<typeof value>(key);
      persistence.put(value);
      expect(persistence.get()).toEqual(value);
    });

    it('can work with the data from custom classes', () => {
      class Custom {
        a = 1;
        constructor(public b: { c: string }) {}
      }
      const value = new Custom({ c: 'hi' });
      const persistence = new Persistence<typeof value>(key);
      persistence.put(value);
      expect(persistence.get()).toEqual({ a: 1, b: { c: 'hi' } });
    });

    it('gets `undefined` when nothing has been set', () => {
      expect(new Persistence<string>(key).get()).toBeUndefined();
    });
  });

  describe('.clear()', () => {
    it('deletes the value', () => {
      const persistence = new Persistence<string>(key);
      persistence.put('exist');
      persistence.clear();
      expect(persistence.get()).toBeUndefined();
    });

    it("doesn't mind being called when already clear", () => {
      const persistence = new Persistence<string>(key);
      persistence.clear();
      persistence.clear();
      expect(persistence.get()).toBeUndefined();
    });
  });
});
