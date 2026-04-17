/**
 * Expects the spy to have been called the exact number of times as the argument lists provided, with those arguments, then resets the spy.
 *
 * ```ts
 * const spy = jasmine.createSpy();
 *
 * spy(1)
 * spy(2, 3)
 * spy()
 * expectCallsAndReset(spy, [1], [2, 3], []);
 * ```
 */
export function expectCallsAndReset(
  spy: jasmine.Spy,
  ...allArgs: any[][]
): void {
  expect(spy).toHaveBeenCalledTimes(allArgs.length);
  expect(spy.calls.allArgs()).toEqual(allArgs);
  spy.calls.reset();
}
