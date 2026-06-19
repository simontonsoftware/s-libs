import { DeeplyAllowMatchers } from 'vitest';

export function expectExactContents<T>(
  actual: T[],
  expected: Array<DeeplyAllowMatchers<T>>,
): void {
  expect(actual).toHaveLength(expected.length);
  expect(actual).toEqual(expect.arrayContaining(expected));
}

export function arrayWithMatch(expected: string | RegExp): any {
  return expect.arrayContaining([expect.stringMatching(expected)]);
}
