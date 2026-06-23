import { expect } from 'vitest';

/**
 * Matches an array that contains a string matching `expected`, which can be either a regex or substring.
 *
 * ```ts
 * expect(['abc', 'def']).toEqual(arrayWithMatch('b'));
 * expect(['abc', 'def']).toEqual(arrayWithMatch(/de/u));
 * ```
 */
export function arrayWithMatch(expected: string | RegExp): any {
  return expect.arrayContaining([expect.stringMatching(expected)]);
}
