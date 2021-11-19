import { IfCouldBe, Nil } from '../interfaces';
import { forEach } from './for-each';
import { doReduce } from './reduce-utils';

/**
 * Reduces `collection` to a value which is the accumulated result of running each element in collection thru `iteratee`, where each successive invocation is supplied the return value of the previous. If accumulator is not given, the first element of collection is used as the initial value.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,177 bytes
 * - Micro-dash: 319 bytes
 */

export function reduce<T extends Nil | readonly any[]>(
  array: T,
  iteratee: (
    accumulator: NonNullable<T>[number],
    value: NonNullable<T>[number],
    index: number,
  ) => NonNullable<T>[number],
): IfCouldBe<T, Nil, undefined> | NonNullable<T>[number];
export function reduce<E, A>(
  array: Nil | readonly E[],
  iteratee: (accumulator: A, value: E, index: number) => A,
  accumulator: A,
): A;
export function reduce<T>(
  object: T,
  iteratee: (
    accumulator: NonNullable<T>[keyof NonNullable<T>],
    value: NonNullable<T>[keyof NonNullable<T>],
    key: keyof NonNullable<T>,
  ) => NonNullable<T>[keyof NonNullable<T>],
): IfCouldBe<T, Nil, undefined> | NonNullable<T>[keyof NonNullable<T>];
export function reduce<T, A>(
  object: T,
  iteratee: (
    accumulator: A,
    value: NonNullable<T>[keyof NonNullable<T>],
    key: keyof NonNullable<T>,
  ) => A,
  accumulator: A,
): A;

export function reduce(collection: any, iteratee: any, accumulator?: any): any {
  return doReduce(
    forEach,
    collection,
    iteratee,
    accumulator,
    arguments.length < 3,
  );
}
