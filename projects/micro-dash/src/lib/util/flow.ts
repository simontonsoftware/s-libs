import { identity } from './identity';

/**
 * Creates a function that returns the result of invoking the given functions with the `this` binding of the created function, where each successive invocation is supplied the return value of the previous.
 *
 * Differences from lodash:
 * - does not accept an array of functions
 * - the first function called can take 0-1 arguments (in lodash it can be any number)
 * - might not construct a new function when it is unnecessary
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,695 bytes
 * - Micro-dash: 111 bytes
 */

// types are from DefinitelyTyped/lodash

// 0-argument first function
export function flow<R1, R2>(f1: () => R1, f2: (a: R1) => R2): () => R2;
export function flow<R1, R2, R3>(
  f1: () => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
): () => R3;
export function flow<R1, R2, R3, R4>(
  f1: () => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
): () => R4;
export function flow<R1, R2, R3, R4, R5>(
  f1: () => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
): () => R5;
export function flow<R1, R2, R3, R4, R5, R6>(
  f1: () => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
): () => R6;
export function flow<R1, R2, R3, R4, R5, R6, R7>(
  f1: () => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
  f7: (a: R6) => R7,
): () => R7;

// 1-argument first function
export function flow<A1, R1, R2>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
): (a1: A1) => R2;
export function flow<A1, R1, R2, R3>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
): (a1: A1) => R3;
export function flow<A1, R1, R2, R3, R4>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
): (a1: A1) => R4;
export function flow<A1, R1, R2, R3, R4, R5>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
): (a1: A1) => R5;
export function flow<A1, R1, R2, R3, R4, R5, R6>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
): (a1: A1) => R6;
export function flow<A1, R1, R2, R3, R4, R5, R6, R7>(
  f1: (a1: A1) => R1,
  f2: (a: R1) => R2,
  f3: (a: R2) => R3,
  f4: (a: R3) => R4,
  f5: (a: R4) => R5,
  f6: (a: R5) => R6,
  f7: (a: R6) => R7,
): (a1: A1) => R7;

export function flow(): <T>(a: T) => T;
export function flow<T>(f1: () => T, ...funcs: Array<(val: T) => T>): () => T;
export function flow<T>(...funcs: Array<(val: T) => T>): (val: T) => T;

export function flow(...funcs: readonly Function[]): Function {
  if (funcs.length) {
    return funcs.reduce(
      (result, func) =>
        (input: unknown): unknown =>
          func(result(input)),
    );
  } else {
    return identity;
  }
}
