import { DeeplyAllowMatchers, expect } from 'vitest';

/**
 * Asserts that the given array contains exactly the expected contents, in any order.
 *
 * ```ts
 * expectExactContents([1, 2, 3], [3, 2, 1]);
 * expectExactContents(['abc'], [expect.stringMatching('bc')]);
 * ```
 */
export function expectExactContents<T>(
  actual: T[],
  expected: Array<DeeplyAllowMatchers<T>>,
): void {
  expect(actual).toHaveLength(expected.length);
  expect(actual).toEqual(expect.arrayContaining(expected));
}
