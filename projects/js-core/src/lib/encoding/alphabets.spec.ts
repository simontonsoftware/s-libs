import { sort } from '../sort';
import {
  ALPHA,
  ALPHA_NUMERIC,
  LOWER_CASE,
  NUMERIC,
  UNRESERVED,
  UPPER_CASE,
} from './alphabets';

describe('alphabet order', () => {
  function testIsSorted(alphabet: string): void {
    expect(sort(alphabet.split('')).join('')).toBe(alphabet);
  }

  // Define alphabets in sort order, to help users' intuition and reasoning about encoded values. E.g. this makes the sort order of original values match the sort order of encoded values, as well as relative "distance" between values.
  it('is sorted', () => {
    testIsSorted(NUMERIC);
    testIsSorted(LOWER_CASE);
    testIsSorted(UPPER_CASE);
    testIsSorted(ALPHA);
    testIsSorted(ALPHA_NUMERIC);
    testIsSorted(UNRESERVED);
  });
});
