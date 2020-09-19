/**
 * Returns a promise that resolves after `ms` milliseconds.
 *
 * ```ts
 * // do something
 * await sleep(1000); // wait a second
 * // do something else
 * ```
 */
export function sleep(ms: number): Promise<undefined> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
