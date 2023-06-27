import { Encoding } from './encoding';

const tmpEncoding = new Encoding();

export function encodeString(
  value: string,
  alphabet: string,
  encodeAlphabet: string,
): string {
  tmpEncoding.pushBoolean(true);
  tmpEncoding.pushString(value, alphabet);
  return tmpEncoding.popStringEncoding(encodeAlphabet);
}

export function decodeString(
  value: string,
  alphabet: string,
  encodeAlphabet: string,
): string {
  tmpEncoding.setStringEncoding(value, encodeAlphabet);
  return tmpEncoding.popStringEncoding(alphabet).slice(1);
}
