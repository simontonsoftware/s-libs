import { elapsedToString, isDefined } from '@s-libs/js-core';

/**
 * Keeps track of elapsed time.
 *
 * ```ts
 * const stopwatch = new Stopwatch();
 * // do some stuff that should be included in time
 * stopwatch.stop();
 * // do some more stuff that should not
 * stopwatch.start();
 * // do more stuff that should be timed
 * console.log(`important stuff took ${stopwatch}`);
 * ```
 */
export class Stopwatch {
  #start?: number;
  #previouslyElapsed: number;

  /**
   * @param running whether the stopwatch is started immediately when constructed
   * @param previouslyElapsed milliseconds to be added to the total
   */
  constructor({ running = true, previouslyElapsed = 0 } = {}) {
    this.#previouslyElapsed = previouslyElapsed;
    if (running) {
      this.start();
    }
  }

  /**
   * Starts adding elapsed time to the total.
   */
  start(): void {
    this.#start ??= performance.now();
  }

  /**
   * Stops adding elapsed time to the total.
   */
  stop(): void {
    this.#previouslyElapsed += this.#getCurrentlyElapsed();
    this.#start = undefined;
  }

  /**
   * @returns the total number of milliseconds added to the total so far.
   */
  getElapsed(): number {
    return this.#previouslyElapsed + this.#getCurrentlyElapsed();
  }

  /**
   * @param units see {@link elapsedToString}
   */
  toString(units = ['d', 'h', 'm', 's', 'ms']): string {
    return elapsedToString(this.getElapsed(), units, {
      showLeadingZeros: false,
    });
  }

  #getCurrentlyElapsed(): number {
    return isDefined(this.#start) ? performance.now() - this.#start : 0;
  }
}
