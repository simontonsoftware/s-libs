import { MagicalMap } from './magical-map';

/**
 * Keep counts associated with unique keys.
 *
 * ```ts
 * const tally = new Tally<string>();
 * tally.get('alice'); // 0
 * tally.add('alice');
 * tally.get('alice'); // 1
 * tally.add('alice', 4);
 * tally.get('alice'); // 5
 * ```
 */
export class Tally<K> {
  #counts = new MagicalMap<K, number>(() => 0);

  add(key: K, amount = 1): void {
    this.#counts.set(key, this.#counts.get(key) + amount);
  }

  get(key: K): number {
    return this.#counts.get(key);
  }

  keys(): Iterable<K> {
    return this.#counts.keys();
  }

  entries(): Iterable<[K, number]> {
    return this.#counts.entries();
  }
}
