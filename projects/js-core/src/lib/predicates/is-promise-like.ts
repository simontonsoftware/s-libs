/**
 * Checks if `value` has a `then()` function, indicating that it is probably promise-like.
 *
 * ```ts
 * isPromiseLike(Promise.resolve('hi')); // true
 * isPromiseLike(Promise.reject('bye')); // true
 * isPromiseLike({}); // false
 * isPromiseLike(null); // false
 * ```
 */
export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return typeof value?.then === 'function';
}
