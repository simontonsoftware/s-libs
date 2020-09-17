import { wrapMethod } from '../to-replace/wrap-method';

/**
 * Designed for temporary use when a test using `fakeAsync` is giving you "Error: X timer(s) still in the queue", and you don't know what they are. Call this at the top of the test to see everything that adds a timer printed to the JS console. In Chrome you can click the function in the console output to be taken directly to its definition in the Sources tab.
 *
 * Be sure to call this _inside_ the test, not before, to get the most useful output.
 *
 * @returns a function to stop the logging
 *
 * ```ts
 * it('definitely does not set any timeouts', fakeAsync(() => {
 *   const stopLogging = logTimers();
 *
 *   doTheRestOfMyTest();
 *
 *   stopLogging();
 * }));
 * ```
 */
export function logTimers(): () => void {
  const restoreTimeouts = wrapMethod(window, 'setTimeout', {
    before(...args: any[]): void {
      console.log('setTimeout(', ...args, ')');
    },
  }) as any;
  const restoreIntervals = wrapMethod(window, 'setInterval', {
    before(...args: any[]): void {
      console.log('setInterval(', ...args, ')');
    },
  }) as any;
  return () => {
    restoreTimeouts();
    restoreIntervals();
  };
}
