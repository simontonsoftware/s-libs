import { noop } from '@s-libs/micro-dash';
import { AsyncPersistence, getCompletion } from './async-persistence';

const storeName = 's-libs/AsyncPersistence';

describe('AsyncPersistence', () => {
  const DB_NAME = 'test-db';
  afterEach(async () => {
    await new AsyncPersistence(DB_NAME).clear();
  });

  it('passes along errors from opening the db', async () => {
    const mockRequest: IDBOpenDBRequest = {} as any;
    const spy = vi.spyOn(indexedDB, 'open').mockReturnValue(mockRequest);
    const persistence = new AsyncPersistence<string>(DB_NAME);
    mockRequest.onerror!(new Event('bad user!'));

    try {
      await persistence.put('sorry');
      throw new Error('this was supposed to throw an error');
    } catch (e: any) {
      expect(e.type).toBe('bad user!');
    }
    spy.mockRestore();
  });

  it('passes along errors from individual calls', async () => {
    const persistence = new AsyncPersistence<VoidFunction>(DB_NAME);

    try {
      await persistence.put(noop);
      throw new Error('this was supposed to throw an error');
    } catch (e: any) {
      expect(e.name).toBe('DataCloneError');
    }
  });

  describe('.put()', () => {
    it('overwrites previous values', async () => {
      const persistence = new AsyncPersistence<string>(DB_NAME);

      await persistence.put('first');
      await persistence.put('second');

      expect(await persistence.get()).toBe('second');
      const keys = await getAllKeys(DB_NAME);
      expect(keys.length).toBe(1);
    });
  });

  describe('.get()', () => {
    it('returns `undefined` when the object is not persisted', async () => {
      const persistence = new AsyncPersistence<string>(DB_NAME);
      await persistence.clear();
      expect(await persistence.get()).toBe(undefined);
    });
  });

  describe('.clear()', () => {
    it('removes the persisted object', async () => {
      const persistence = new AsyncPersistence<string>(DB_NAME);
      await persistence.put('goodbye');

      await persistence.clear();

      expect(await persistence.get()).toBe(undefined);
    });
  });

  it('works for the example in the docs', async () => {
    // if `DB_NAME` has never been used before
    const persistence = new AsyncPersistence(DB_NAME);
    expect(await persistence.get()).toBeUndefined();

    // now you set it
    await persistence.put({ name: 'Robert' });

    // this will work even after the app reloads (e.g. the next week)
    expect(await persistence.get()).toEqual({ name: 'Robert' });
  });
});

async function getAllKeys(dbName: string): Promise<IDBValidKey[]> {
  const db = await getCompletion(indexedDB.open(dbName));
  return getCompletion(
    db.transaction(storeName).objectStore(storeName).getAllKeys(),
  );
}
