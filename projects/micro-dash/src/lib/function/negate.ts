/**
 * Creates a function that negates the result of the predicate `func`. The `func` predicate is invoked with the `this` binding and arguments of the created function.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 357 bytes
 * - Micro-dash: 107 bytes
 */
export function negate<F extends (...args: any[]) => any>(
  predicate: F,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => boolean {
  return function (this: any, ...args): boolean {
    return !predicate.apply(this, args);
  } as F;
}
