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
});
