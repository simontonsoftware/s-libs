import { wrapFunction, Hooks } from './wrap-function';

/**
 * Replaces a method on `object` with a wrapped version that will call the provided hooks in addition to the original method. See `wrapFunction()` for more details on the hooks.
 *
 * @returns a function to reset the method to its previous, unwrapped state
 *
 * ```ts
 * // log all get requests to the console
 * wrapMethod(HttpClient.prototype, "get", {
 *   before(url) {
 *     console.log("Sending GET request to", url);
 *   }
 * });
 *
 * // suppress benign error messages
 * const unwrap = wrapMethod(console, "error", {
 *   around(original, ...args) {
 *     if (args[0].message !== 'something benign') {
 *       original(...args);
 *     }
 *   }
 * });
 *
 * // remove error suppression (from above)
 * unwrap();
 * ```
 */
export function wrapMethod<
  K extends keyof any,
  O extends { [k in K]: (...args: any) => any }
>(
  object: O,
  key: K,
  hooks: Hooks<Parameters<O[K]>, ReturnType<O[K]>, ThisType<O[K]>>,
): () => void {
  const original = object[key];
  object[key] = wrapFunction(original, hooks) as O[K];
  return () => {
    object[key] = original;
  };
}
