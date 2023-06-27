import { assert } from '@s-libs/js-core';
import { sort } from '../sort';

const CHUNK_BOUND = 64;

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

  setStringEncoding(value: string, alphabet: string): void {
    this.#asNumber = 0n;
    this.#pushString(value, alphabet);
  }

  popStringEncoding(alphabet: string): string {
    return this.#pullString(alphabet, () => this.hasData());
  }

  setBigintEncoding(value: bigint): void {
    this.#asNumber = value;
  }

  popBigintEncoding(): bigint {
    const encoding = this.#asNumber;
    this.#asNumber = 0n;
    return encoding;
  }

  pushString(value: string, alphabet: string): void {
    this.#pushString(value, alphabet);
  }

  popString(length: number, alphabet: string): string {
    return this.#pullString(alphabet, (chars) => chars.length < length);
  }

  pushUnboundedInt(value: number): void {
    this.pushBoolean(value < 0);
    this.pushNaturalNumber(Math.abs(value));
  }

  popUnboundedInt(): number {
    const value = this.popNaturalNumber();
    return this.popBoolean() ? -value : value;
  }

  /** allows 0 */
  pushNaturalNumber(value: number): void {
    assert(
      value >= 0 && value % 1 === 0,
      `value (${value}) must be a natural number`,
    );
    for (let pushedOne = false; ; pushedOne = true) {
      this.pushBoolean(pushedOne);

      const chunk = value % CHUNK_BOUND;
      value = Math.floor(value / CHUNK_BOUND);
      this.pushInteger(chunk, CHUNK_BOUND);

      if (value === 0) {
        return;
      }
    }
  }

  /** allows 0 */
  popNaturalNumber(): number {
    let value = 0;
    do {
      value *= CHUNK_BOUND;
      value += this.popInteger(CHUNK_BOUND);
    } while (this.popBoolean());
    return value;
  }

  /**
   * Push a number between the given bounds (inclusive). The bounds can be specified in either order (`min, max` or `max, min`).
   */
  pushInteger(value: number, bound1: number, bound2 = 0): void {
    assert(value % 1 === 0, `value (${value}) must be an integer`);
    const [min, max] = sort([bound1, bound2]);
    assert(value >= min, `value (${value}) must be at least ${min}`);
    assert(value <= max, `value (${value}) must be at most ${max}`);
    this.#push(value - min, max - min + 1);
  }

  /**
   * The bounds can be specified in either order (`min, max` or `max, min`).
   */
  popInteger(bound1: number, bound2 = 0): number {
    const [min, max] = sort([bound1, bound2]);
    return this.#pop(max - min + 1) + min;
  }

  pushBoolean(value: boolean): void {
    this.#push(value ? 1 : 0, 2);
  }

  popBoolean(): boolean {
    return !!this.#pop(2);
  }

  pushOption<T>(value: T, options: readonly T[]): void {
    const index = options.indexOf(value);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    assert(index >= 0, `value (${value}) not found in options`);
    this.#push(index, options.length);
  }

  popOption<T>(options: readonly T[]): T {
    return options[this.#pop(options.length)];
  }

  /**
   * Returns an indication whether data has been push to this encoding but not popped. **It is possible for this to return `true` even after pushing data.** This happens when the only things that have been pushed are represented internally as 0 (such as the flag `false`, or an option at index `0`).
   */
  hasData(): boolean {
    return this.#asNumber > 0n;
  }

  #pushString(value: string, alphabet: string): void {
    for (const c of value) {
      const index = alphabet.indexOf(c);
      assert(
        index >= 0,
        `value contains a character that is not in alphabet: ${c}`,
      );
      this.#push(index, alphabet.length);
    }
  }

  #pullString(
    alphabet: string,
    pullMore: (chars: string[]) => boolean,
  ): string {
    const chars: string[] = [];
    while (pullMore(chars)) {
      chars.push(alphabet[this.#pop(alphabet.length)]);
    }
    return chars.reverse().join('');
  }

  #push(value: number, numValues: number): void {
    this.#asNumber = this.#asNumber * BigInt(numValues) + BigInt(value);
  }

  #pop(numValues: number): number {
    const value = this.#asNumber % BigInt(numValues);
    this.#asNumber /= BigInt(numValues);
    return Number(value);
  }
}
