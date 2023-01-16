import { assert } from './assert';
import { sort } from './sort';

/**
 * Convert arbitrary data to and from a compact string representation. Push data into the encoding one field at a time and convert it to a string. Later you can pull it back out in reverse order. The string is as compact as possible because it memorizes only your data, and does not need to capture field names.
 *
 * ```ts
 * const hexAlphabet = '0123456789abcdef';
 * const options = ['disagree', 'neutral', 'agree'];
 *
 * // encode some survey answers into a hex string
 * encoding = new Encoding();
 * encoding.pushNumber(5, 1, 5); // encode 5, where it could be between 1-5
 * encoding.pushBoolean(true);
 * encoding.pushOption('agree', options);
 * const hexString = encoding.pullAllAsString(hexAlphabet);
 * expect(hexString).toBe('1d');
 *
 * // later decode the string back into the survey answers
 * encoding = new Encoding();
 * encoding.pushString(hexString, hexAlphabet);
 * expect(encoding.pullOption(options)).toBe('agree');
 * expect(encoding.pullBoolean()).toBe(true);
 * expect(encoding.pullNumber(1, 5)).toBe(5);
 */
export class Encoding {
  #asNumber = 0n;

  pushString(value: string, alphabet: string): void {
    for (const c of value) {
      const index = alphabet.indexOf(c);
      assert(
        index >= 0,
        `value contains a character that is not in alphabet: ${c}`,
      );
      this.#push(index, alphabet.length);
    }
  }

  pullAllAsString(alphabet: string): string {
    let asString = '';
    while (this.hasData()) {
      asString = alphabet[this.#pull(alphabet.length)] + asString;
    }
    return asString;
  }

  /**
   * Push a number between the given bounds (inclusive). The bounds can be specified in either order (`min, max` or `max, min`).
   */
  pushNumber(value: number, bound1: number, bound2 = 0): void {
    const [min, max] = sort([bound1, bound2]);
    assert(value >= min, `value (${value}) must be at least ${min}`);
    assert(value <= max, `value (${value}) must be at most ${max}`);
    this.#push(value - min, max - min + 1);
  }

  /**
   * The bounds can be specified in either order (`min, max` or `max, min`).
   */
  pullNumber(bound1: number, bound2 = 0): number {
    const [min, max] = sort([bound1, bound2]);
    return this.#pull(max - min + 1) + min;
  }

  pushBoolean(value: boolean): void {
    this.#push(value ? 1 : 0, 2);
  }

  pullBoolean(): boolean {
    return !!this.#pull(2);
  }

  pushOption<T>(value: T, options: readonly T[]): void {
    const index = options.indexOf(value);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    assert(index >= 0, `value (${value}) not found in options`);
    this.#push(index, options.length);
  }

  pullOption<T>(options: readonly T[]): T {
    return options[this.#pull(options.length)];
  }

  /**
   * Returns an indication whether data has been push to this encoding but not pulled. **It is possible for this to return `true` even after pushing data.** This happens when the only things that have been pushed are represented internally as 0 (such as the flag `false`, or an option at index `0`).
   */
  hasData(): boolean {
    return this.#asNumber > 0n;
  }

  #push(value: number, numValues: number): void {
    this.#asNumber = this.#asNumber * BigInt(numValues) + BigInt(value);
  }

  #pull(numValues: number): number {
    const value = this.#asNumber % BigInt(numValues);
    this.#asNumber /= BigInt(numValues);
    return Number(value);
  }
}
