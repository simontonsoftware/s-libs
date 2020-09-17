/** @hidden */
export interface Hooks<A extends any[], R, T> {
  before?: (this: T, ...args: A) => void;
  around?: (this: T, fn: (...args: A) => R, ...args: A) => R;
  transform?: (this: T, result: R, ...args: A) => R;
  after?: (this: T, result: R, ...args: A) => void;
}

/**
 * Returns a new function to use in place of `func` that will call the provided hooks in addition to `func`. They are called in the following order:
 *
 * 1. `before`
 * 2. `around` if provided, else `original`
 * 3. `transform`
 * 4. `after`
 *
 * ```ts
 * const sum = (a: number, b: number) => a + b;
 * const sumAndLog = wrapFunction(sum, {
 *   after: (result, a, b) => {
 *     console.log(a, '+', b, '=', result);
 *   },
 * }
 * const sumPlusOne = wrapFunction(sum, {
 *   transform: (result) => result + 1,
 * });
 * ```
 */
export function wrapFunction<A extends any[], R, T>(
  original: (this: T, ...args: A) => R,
  hooks: Hooks<A, R, T>,
): (this: T, ...args: A) => R {
  const wrapped = function (this: T, ...args: A): R {
    let result: R;
    callHook(hooks.before, this, args);
    if (hooks.around) {
      result = (hooks.around as any).call(this, original, ...args);
    } else {
      result = original.apply(this, args);
    }
    result = callHook(hooks.transform, this, [result, ...args], result);
    callHook(hooks.after, this, [result, ...args]);
    return result;
  };
  Object.defineProperty(wrapped, 'length', { value: original.length });
  return wrapped;
}

/** @hidden */
function callHook(
  hook: Function | undefined,
  context: any,
  args: any[],
  defaultResult?: any,
): any {
  return hook ? hook.apply(context, args) : defaultResult;
}
