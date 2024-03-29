/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked. The debounced function comes with a `cancel` method to cancel delayed `func` invocations. The `func` is invoked with the last arguments provided to the debounced function.
 *
 * If `wait` is 0, `func` invocation is deferred until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * Differences from lodash:
 * - the debounced function does not come with a `flush` method
 * - does not accept options
 * - does not return the results of the last invocation
 * - does not make any guarantees about the value of `this` in `func`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 2,410 bytes
 * - Micro-dash: 149 bytes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: number;
  const cancel = (): void => {
    clearTimeout(timeoutId);
  };
  const debounced = (...args: unknown[]): void => {
    cancel();
    timeoutId = setTimeout(func, wait, ...args);
  };
  return Object.assign(debounced, { cancel });
}
