/**
 * A map where calling `.get()` will add a value to the map before returning it, if it does not yet exist.
 *
 * ```ts
 * const tallies = new MagicalMap<string, number>(() => 0);
 * tallies.get('joe'); // 0
 * tallies.set('fred', tallies.get('fred') + 1);
 * tallies.get('fred'); // 1
 * ```
 */
export class MagicalMap<Key, Value> {
  #map = new Map<Key, Value>();

  /**
   * @param createNewValue called when trying to `get()` for a key that is not yet in the map. The return value of `createNewValue` will be set into the map, then returned.
   */
  constructor(private createNewValue: (key: Key) => Value) {}

  set(key: Key, value: Value): void {
    this.#map.set(key, value);
  }

  get(key: Key): Value {
    if (this.#map.has(key)) {
      return this.#map.get(key)!;
    }

    const value = this.createNewValue(key);
    this.#map.set(key, value);
    return value;
  }

  keys(): Iterable<Key> {
    return this.#map.keys();
  }

  values(): Iterable<Value> {
    return this.#map.values();
  }

  entries(): Iterable<[Key, Value]> {
    return this.#map.entries();
  }
}
