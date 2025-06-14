import { identity } from './identity';

/**
 * This function is like `flow` except that it creates a function that invokes the given functions from right to left.
 *
 * Differences from lodash:
 * - does not accept an array of functions
 * - the first function called can take 0-1 arguments (in lodash it can be any number)
 * - might not construct a new function when it is unnecessary
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,710 bytes
 * - Micro-dash: 111 bytes
 */

// 0-argument first function
export function flowRight<R1, R2>(f2: (a: R1) => R2, f1: () => R1): () => R2;
export function flowRight<R1, R2, R3>(
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: () => R1,
): () => R3;
export function flowRight<R1, R2, R3, R4>(
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: () => R1,
): () => R4;
export function flowRight<R1, R2, R3, R4, R5>(
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: () => R1,
): () => R5;
export function flowRight<R1, R2, R3, R4, R5, R6>(
  f6: (a: R5) => R6,
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: () => R1,
): () => R6;
export function flowRight<R1, R2, R3, R4, R5, R6, R7>(
  f7: (a: R6) => R7,
  f6: (a: R5) => R6,
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: () => R1,
): () => R7;

// 1-argument first function
export function flowRight<A1, R1, R2>(
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R2;
export function flowRight<A1, R1, R2, R3>(
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R3;
export function flowRight<A1, R1, R2, R3, R4>(
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R4;
export function flowRight<A1, R1, R2, R3, R4, R5>(
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R5;
export function flowRight<A1, R1, R2, R3, R4, R5, R6>(
  f6: (a: R5) => R6,
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R6;
export function flowRight<A1, R1, R2, R3, R4, R5, R6, R7>(
  f7: (a: R6) => R7,
  f6: (a: R5) => R6,
  f5: (a: R4) => R5,
  f4: (a: R3) => R4,
  f3: (a: R2) => R3,
  f2: (a: R1) => R2,
  f1: (a1: A1) => R1,
): (a1: A1) => R7;

export function flowRight(): <T>(a: T) => T;
export function flowRight<T>(
  ...funcs: [...Array<(val: T) => T>, f1: () => T]
): () => T;
export function flowRight<T>(...funcs: Array<(val: T) => T>): (val: T) => T;

export function flowRight(...funcs: readonly Function[]): Function {
  if (funcs.length) {
    return funcs.reduce(
      (result, func) =>
        (input: unknown): unknown =>
          result(func(input)),
    );
  } else {
    return identity;
  }
}
