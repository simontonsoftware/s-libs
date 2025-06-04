import { identity } from './identity';

type FlowRight<
  In extends any[],
  Next,
  Rest extends Function[],
> = Rest extends []
  ? (...a: In) => Next
  : Rest extends [...infer Rest2 extends Function[], (a: Next) => infer Cur2]
    ? FlowRight<In, Cur2, Rest2>
    : never;

/**
 * This function is like `flow` except that it creates a function that invokes the given functions from right to left.
 *
 * Differences from lodash:
 * - does not accept an arrays of functions
 * - might not construct a new function when it is not needed
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,710 bytes
 * - Micro-dash: 111 bytes
 */

export function flowRight(): <T>(a: T) => T;
export function flowRight<In extends any[], Next, Rest extends Function[]>(
  ...funcs: [...rest: Rest, f1: (...a: In) => Next]
): FlowRight<In, Next, Rest>;
export function flowRight<T>(...funcs: Array<(a: T) => T>): (a: T) => T;

export function flowRight(...funcs: Function[]): Function {
  if (funcs.length) {
    return funcs.reduce(
      (result, func) =>
        (...input: unknown[]): unknown =>
          result(func(...input)),
    );
  } else {
    return identity;
  }
}
