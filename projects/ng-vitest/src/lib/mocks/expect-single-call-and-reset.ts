import { Mock } from 'vitest';

/**
 * Expects exactly one call to have been made to a vitest mock, for it to have received the given arguments, then clears the mock.
 *
 * ```ts
 * const mock = vi.fn();
 *
 * mock(1, 2);
 * expectSingleCallAndReset(mock, 1, 2); // pass
 * expectSingleCallAndReset(mock, 1, 2); // fail
 *
 * mock(3);
 * mock(4);
 * expectSingleCallAndReset(mock, 3); // fail
 * ```
 */
export function expectSingleCallAndReset(mock: Mock, ...args: unknown[]): void {
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith(...args);
  mock.mockClear();
}
