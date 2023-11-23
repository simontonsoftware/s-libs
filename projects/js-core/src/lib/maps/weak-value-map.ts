/**
 * A map that holds weak references to its values (i.e. it does not prevent its values from being garbage collected).
 */
export class WeakValueMap<K, V extends object> {
  #map = new Map<K, WeakRef<V>>();
  #registry = new FinalizationRegistry<K>((heldValue) => {
    this.#map.delete(heldValue);
  });

  /**
   * Returns `undefined` if the value was garbage collected.
   */
  get(key: K): V | undefined {
    return this.#map.get(key)?.deref();
  }

  set(key: K, value: V): this {
    const oldRef = this.#map.get(key);
    if (oldRef) {
      this.#registry.unregister(oldRef);
    }

    const ref = new WeakRef(value);
    this.#map.set(key, ref);
    this.#registry.register(value, key, ref);
    return this;
  }
}
