import { ValuesType } from 'utility-types';
import {
  IfCouldBe,
  Narrow,
  Nil,
  ValueIteratee,
  ValueNarrowingIteratee,
} from '../interfaces';
import { forEach } from './for-each';

/**
 * Creates an array of elements split into two groups, the first of which contains elements `predicate` returns truthy for, the second of which contains elements `predicate` returns falsey for.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,926 bytes
 * - Micro-dash: 344 bytes
 */

export function partition<T, O>(
  array: Nil | T,
  predicate: ValueNarrowingIteratee<ValuesType<T>, O>,
): [
  IfCouldBe<ValuesType<T>, O, Array<Narrow<ValuesType<T>, O>>, []>,
  Exclude<ValuesType<T>, O> extends never
    ? []
    : Array<Exclude<ValuesType<T>, O>>,
];
export function partition<T>(
  array: Nil | T,
  predicate: ValueIteratee<ValuesType<T>, any>,
): [Array<ValuesType<T>>, Array<ValuesType<T>>];

export function partition(collection: any, predicate: any): any {
  const result: [any[], any] = [[], []];
  forEach(collection, (value) => result[predicate(value) ? 0 : 1].push(value));
  return result;
}
