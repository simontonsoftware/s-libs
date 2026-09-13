import { Mock } from 'vitest';

/**
 * Expects the mock to have been called the exact number of times as the argument lists provided, with those arguments in that order, then clears the mock.
 *
 * ```ts
 * const mock = vi.fn();
 *
 * mock(1)
 * mock(2, 3)
 * mock()
 * expectCallsAndReset(mock, [1], [2, 3], []);
 * ```
 */
export function expectCallsAndReset(mock: Mock, ...allArgs: any[][]): void {
  expect(mock).toHaveBeenCalledTimes(allArgs.length);
  expect(mock.mock.calls).toEqual(allArgs);
  mock.mockClear();
}
