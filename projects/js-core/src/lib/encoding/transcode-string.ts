import { Encoding } from './encoding';

const tmpEncoding = new Encoding();

/**
 * Transforms `value` to be represented using a different set of characters, in a way that can be decoded later with {@link decodeString}.
 *
 * ```ts
 * // encode a UUID into a more compact form to include in a URL parameter
 * const uuid = 'd5942ea9-6520-42ea-9ced-7013285e4085';
 * const UUID_ALPHABET = `-${NUMERIC_ALPHABET}abcdef`;
 *
 * const encoded = encodeString(uuid, UUID_ALPHABET, UNRESERVED_ALPHABET);
 * const decoded = decodeString(encoded, UUID_ALPHABET, UNRESERVED_ALPHABET);
 *
 * expect(encoded).toBe('5pNPwHKvWJeLh-wMQ6_ohqcAm');
 * expect(decoded).toBe(uuid);
 * ```
 */
export function encodeString(
  value: string,
  alphabet: string,
  encodeAlphabet: string,
): string {
  tmpEncoding.pushBoolean(true);
  tmpEncoding.pushString(value, alphabet);
  return tmpEncoding.popStringEncoding(encodeAlphabet);
}

/**
 * Decodes the return value from {@linkcode encodeString}. See the docs there for more details.
 */
export function decodeString(
  value: string,
  alphabet: string,
  encodeAlphabet: string,
): string {
  tmpEncoding.setStringEncoding(value, encodeAlphabet);
  return tmpEncoding.popStringEncoding(alphabet).slice(1);
}
