import { isNil } from '@s-libs/micro-dash';

/**
 * Get and put objects from/to local storage. They will be (de)serialized as JSON, so be sure that's OK for your objects.
 *
 * If localStorage is not available, all methods essentially act as noops.
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `localStorage` can be undefined e.g. in an Android WebView that doesn't have the option turned on
    localStorage?.setItem(this.key, JSON.stringify(obj));
  }

  /**
   * Retrieves a deserialized copy of the saved object, or `undefined` if it has not been set.
   */
  get(): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `localStorage` can be undefined e.g. in an Android WebView that doesn't have the option turned on
    const savedStr = localStorage?.getItem(this.key);
    return isNil(savedStr) ? undefined : (JSON.parse(savedStr) as T);
  }

  /**
   * Deletes the saved item from local storage.
   */
  clear(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `localStorage` can be undefined e.g. in an Android WebView that doesn't have the option turned on
    localStorage?.removeItem(this.key);
  }
}
