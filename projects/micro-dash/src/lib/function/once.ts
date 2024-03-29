/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls to the function return the value of the first invocation. The `func` is invoked with the `this` binding and arguments of the created function.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,809 bytes
 * - Micro-dash: 100 bytes
 */
export function once<T extends (...args: any[]) => any>(
  func: T,
): (this: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T> {
  let result: ReturnType<T>;
  let needsCall = true;
  return function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): ReturnType<T> {
    if (needsCall) {
      needsCall = false;
      result = func.apply(this, args);

      // allow func and any of its variables to be garbage collected
      (func as any) = 0;
    }
    return result;
  };
}
