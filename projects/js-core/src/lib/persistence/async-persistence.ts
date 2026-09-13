import { Deferred } from '../time/deferred';

const storeName = 's-libs/AsyncPersistence';
const objKey = 'obj';

/**
 * Get and put objects from/to IndexedDB.
 *
 * ```ts
 * // if `DB_NAME` has never been used before
 * const persistence = new AsyncPersistence(DB_NAME);
 * expect(await persistence.get()).toBeUndefined();

 * // now you set it
 * await persistence.put({ name: 'Robert' });

 * // this will work even after the app reloads (e.g. the next week)
 * expect(await persistence.get()).toEqual({ name: 'Robert' });
 * ```
 */
export class AsyncPersistence<T> {
  #dbDeferred = new Deferred<IDBDatabase>();

  /**
   * @param dbName The name of the IndexedDB database in which to find the existing object (if any), and to save it.
   */
  constructor(dbName: string) {
    const openRequest = indexedDB.open(dbName);
    openRequest.onupgradeneeded = (): void => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    openRequest.onsuccess = (): void => {
      this.#dbDeferred.resolve(openRequest.result);
    };
    openRequest.onerror = this.#dbDeferred.reject;
  }

  /** Saves `obj` to the IndexedDB database. */
  async put(obj: T): Promise<void> {
    const store = await this.#getStore('readwrite');
    await getCompletion(store.put(obj, objKey));
  }

  /** Retrieves the object from the IndexedDB database, or `undefined` if it has not been set. */
  async get(): Promise<T | undefined> {
    const store = await this.#getStore();
    return getCompletion<T | undefined>(store.get(objKey));
  }

  /** Deletes the saved item from the IndexedDB database. */
  async clear(): Promise<void> {
    const store = await this.#getStore('readwrite');
    await getCompletion(store.delete(objKey));
  }

  async #getStore(mode?: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.#dbDeferred.promise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }
}

export async function getCompletion<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = reject;
    request.onsuccess = (): void => {
      resolve(request.result);
    };
  });
}
