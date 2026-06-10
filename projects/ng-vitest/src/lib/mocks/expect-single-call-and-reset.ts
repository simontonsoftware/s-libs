import { Mock } from 'vitest';

/**
 * Expects exactly one call to have been made to a jasmine spy, for it to have received the given arguments, then resets the spy.
 *
 * ```ts
 * const spy = jasmine.createSpy();
 *
 * spy(1, 2);
 * expectSingleCallAndReset(spy, 1, 2); // pass
 * expectSingleCallAndReset(spy, 1, 2); // fail
 *
 * spy(3);
 * spy(4);
 * expectSingleCallAndReset(spy, 3); // fail
 * ```
 */
export function expectSingleCallAndReset(mock: Mock, ...args: unknown[]): void {
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith(...args);
  mock.mockClear();
}
