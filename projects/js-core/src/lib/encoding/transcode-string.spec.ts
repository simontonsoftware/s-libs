import { NUMERIC_ALPHABET, UNRESERVED_ALPHABET } from './alphabets';
import { decodeString, encodeString } from './transcode-string';

describe('encodeString() and decodeString()', () => {
  // eslint-disable-next-line max-params
  function test(
    value: string,
    alphabet: string,
    encoded: string,
    encodeAlphabet: string,
  ): void {
    expect(encodeString(value, alphabet, encodeAlphabet)).toBe(encoded);
    expect(decodeString(encoded, alphabet, encodeAlphabet)).toBe(value);
  }

  it('works', () => {
    // encode alphabet is bigger
    test('123', '54321', '242', '0123456789');
    // encode alphabet is smaller
    test('123123123', '54321', '1110011110110000011000', '01');
    // leading zeros
    test('123', '123', '2123', '123');
  });

  it('works for the example in the docs', () => {
    // encode a UUID into a more compact form to include in a URL parameter
    const uuid = 'd5942ea9-6520-42ea-9ced-7013285e4085';
    const UUID_ALPHABET = `-${NUMERIC_ALPHABET}abcdef`;

    const encoded = encodeString(uuid, UUID_ALPHABET, UNRESERVED_ALPHABET);
    const decoded = decodeString(encoded, UUID_ALPHABET, UNRESERVED_ALPHABET);

    expect(encoded).toBe('5pNPwHKvWJeLh-wMQ6_ohqcAm');
    expect(decoded).toBe(uuid);
  });
});
