import { convertTime } from './time-utils';

/**
 * Returns a promise that resolves after a specified delay.
 *
 * @param unit Can be anything listed in the docs for {@link TimeUnit}. Defaults to milliseconds
 *
 * ```ts
 * // do something
 * await sleep(1_000); // wait 1 second
 * // do something else
 * await sleep(2, 'hours'); // wait 2 hours
 * // do a final thing
 * ```
 */
export async function sleep(delay: number, unit = 'ms'): Promise<undefined> {
  return new Promise((resolve) => {
    setTimeout(resolve, convertTime(delay, unit, 'ms'));
  });
}
