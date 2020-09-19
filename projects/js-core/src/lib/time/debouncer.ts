/**
 * Like a standard debounce from e.g. `micro-dash`, but can execute a different function for a different wait period at each invocation.
 *
 * ```ts
 * const print = (value) => console.log(value);
 * const debouncer = new Debouncer();
 *
 * debouncer.run(print, 1000, 1);
 * await sleep(500);
 *
 * debouncer.run(print, 1000, 2);
 * await sleep(1000); // prints "2"
 *
 * debouncer.run(print, 0, 3);
 * debouncer.run(print, 1000, 4);
 * await sleep(500);
 *
 * debouncer.run(print, 2000, 5);
 * debouncer.run(print, 50, 6);
 * await sleep(50); // prints "6"
 * ```
 */
export class Debouncer {
  private timeoutId?: ReturnType<typeof setTimeout>;

  run<T extends (...args: any[]) => any>(
    func: T,
    wait = 0,
    ...args: Parameters<T>
  ): void {
    this.cancel();
    this.timeoutId = setTimeout(func, wait, ...args);
  }

  cancel(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
  }
}
