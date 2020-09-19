/**
 * Get and put objects from/to local storage. They will be (de)serialized as JSON, so be sure that's OK for your objects.
 *
 * ```ts
 *  // if 'my key' has never been used before
 *  const persistence = new Persistence('my key');
 *  persistence.get(); // returns `undefined`
 *
 *  // now you set it
 *  persistence.put({ name: 'Robert' });
 *
 *  // this will work even after the app reloads (e.g. the next week)
 *  persistence.get(); // returns { name: 'Robert' }
 * ```
 */
export class Persistence<T> {
  /**
   * @param key The key in local storage at which to find the existing object (if any), and to save it.
   */
  constructor(private key: string) {}

  /**
   * Serializes `obj` and saves it in local storage.
   */
  put(obj: T): void {
    localStorage.setItem(this.key, JSON.stringify(obj));
  }

  /**
   * Retrieves a deserialized copy of the saved object, or `undefined` if it has not been set.
   */
  get(): T {
    const savedStr = localStorage.getItem(this.key);
    return savedStr === null ? undefined : JSON.parse(savedStr);
  }

  /**
   * Deletes the saved item from local storage.
   */
  clear(): void {
    localStorage.removeItem(this.key);
  }
}
