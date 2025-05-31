import { identity } from './identity';

type Flow<In extends any[], Next, Rest extends Function[]> = Rest extends []
  ? (...a: In) => Next
  : Rest extends [(a: Next) => infer Cur, ...infer Rest extends Function[]]
    ? Flow<In, Cur, Rest>
    : never;

/**
 * Creates a function that returns the result of invoking the given functions with the `this` binding of the created function, where each successive invocation is supplied the return value of the previous.
 *
 * Differences from lodash:
 * - does not accept an array of functions
 * - might not construct a new function when it is not needed
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,695 bytes
 * - Micro-dash: 111 bytes
 */

export function flow(): <T>(a: T) => T;
export function flow<In extends any[], Next, Rest extends Function[]>(
  f1: (...a: In) => Next,
  ...rest: Rest
): Flow<In, Next, Rest>;
export function flow<T>(...funcs: Array<(a: T) => T>): (a: T) => T;

export function flow(...funcs: Function[]): Function {
  if (funcs.length) {
    return funcs.reduce(
      (result, func) =>
        (...input: unknown[]): unknown =>
          func(result(...input)),
    );
  } else {
    return identity;
  }
}
