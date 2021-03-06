import { IfCouldBe, Nil } from '../interfaces';
import { forEachRight } from './for-each-right';
import { doReduce } from './reduce-utils';

/**
 * This method is like `_.reduce` except that it iterates over elements of `collection` from right to left.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,156 bytes
 * - Micro-dash: 315 bytes
 */

export function reduceRight<T extends readonly any[] | Nil>(
  array: T,
  iteratee: (
    accumulator: NonNullable<T>[number],
    value: NonNullable<T>[number],
    index: number,
  ) => NonNullable<T>[number],
): NonNullable<T>[number] | IfCouldBe<T, Nil, undefined>;
export function reduceRight<E, A>(
  array: readonly E[] | Nil,
  iteratee: (accumulator: A, value: E, index: number) => A,
  accumulator: A,
): A;
export function reduceRight<T>(
  object: T,
  iteratee: (
    accumulator: NonNullable<T>[keyof NonNullable<T>],
    value: NonNullable<T>[keyof NonNullable<T>],
    key: keyof NonNullable<T>,
  ) => NonNullable<T>[keyof NonNullable<T>],
): NonNullable<T>[keyof NonNullable<T>] | IfCouldBe<T, Nil, undefined>;
export function reduceRight<T, A>(
  object: T,
  iteratee: (
    accumulator: A,
    value: NonNullable<T>[keyof NonNullable<T>],
    key: keyof NonNullable<T>,
  ) => A,
  accumulator: A,
): A;

export function reduceRight(
  collection: any,
  iteratee: Function,
  accumulator?: any,
): any {
  return doReduce(
    forEachRight,
    collection,
    iteratee,
    accumulator,
    arguments.length < 3,
  );
}
