import { sort } from '../sort';
import {
  ALPHA_ALPHABET,
  ALPHA_NUMERIC_ALPHABET,
  LOWER_CASE_ALPHABET,
  NUMERIC_ALPHABET,
  UNRESERVED_ALPHABET,
  UPPER_CASE_ALPHABET,
} from './alphabets';

describe('alphabet order', () => {
  function testIsSorted(alphabet: string): void {
    expect(sort(alphabet.split('')).join('')).toBe(alphabet);
  }

  // Define alphabets in sort order, to help users' intuition and reasoning about encoded values. E.g. this makes the sort order of original values match the sort order of encoded values, as well as relative "distance" between values.
  it('is sorted', () => {
    testIsSorted(NUMERIC_ALPHABET);
    testIsSorted(LOWER_CASE_ALPHABET);
    testIsSorted(UPPER_CASE_ALPHABET);
    testIsSorted(ALPHA_ALPHABET);
    testIsSorted(ALPHA_NUMERIC_ALPHABET);
    testIsSorted(UNRESERVED_ALPHABET);
  });
});
