import {
  ArrayIteratee,
  ArrayNarrowingIteratee,
  Cast,
  IfCouldBe,
  KeyNarrowingIteratee,
  Narrow,
  Nil,
  ObjectIteratee,
  ValueNarrowingIteratee,
} from '../interfaces';
import { keysOfNonArray } from '../object/keys';

type DefiniteValueMatches<T, O> = {
  [K in keyof T]: T[K] extends O ? T[K] : never;
}[keyof T];
type PossibleValueMatches<T, O> = {
  [K in keyof T]: IfCouldBe<T[K], O, Narrow<T[K], O>>;
}[keyof T];

type DefiniteKeyMatches<T, O> = {
  [K in keyof T]: Cast<K, string> extends O ? T[K] : never;
}[keyof T];
type PossibleKeyMatches<T, O> = {
  [K in keyof T]: IfCouldBe<Cast<K, string>, O, T[K]>;
}[keyof T];

/**
 * Iterates over elements of `collection`, returning the first element `predicate` returns truthy for.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 15,296 bytes
 * - Micro-dash: 264 bytes
 */

// array: value narrowing
export function find<I, O>(
  array: Nil | readonly I[],
  predicate: ArrayNarrowingIteratee<O>,
  fromIndex?: number,
): Extract<I, O> | Extract<O, I> | undefined;

// array
export function find<T>(
  array: Nil | readonly T[],
  predicate: ArrayIteratee<T, boolean>,
  fromIndex?: number,
): T | undefined;

// object: value narrowing
export function find<
  I,
  T extends NonNullable<I>,
  O,
  F extends number | undefined = undefined,
>(
  object: I,
  predicate: ValueNarrowingIteratee<T, O>,
  fromIndex?: F,
):
  | IfCouldBe<F, number, undefined>
  | IfCouldBe<I, Nil, undefined>
  | PossibleValueMatches<T, O>
  | (DefiniteValueMatches<T, O> extends never ? undefined : never);

// object: key narrowing
export function find<
  I,
  T extends NonNullable<I>,
  O,
  F extends number | undefined = undefined,
>(
  object: I,
  predicate: KeyNarrowingIteratee<T, O>,
  fromIndex?: F,
):
  | IfCouldBe<F, number, undefined>
  | IfCouldBe<I, Nil, undefined>
  | PossibleKeyMatches<T, O>
  | (DefiniteKeyMatches<T, O> extends never ? undefined : never);

// object
export function find<T>(
  object: Nil | T,
  predicate: ObjectIteratee<T, boolean>,
  fromIndex?: number,
): T[keyof T] | undefined;

export function find(collection: any, predicate: Function, fromIndex = 0): any {
  if (Array.isArray(collection)) {
    return collection
      .slice(fromIndex)
      .find((item, index) => predicate(item, index));
  } else {
    for (const key of keysOfNonArray(collection).slice(fromIndex)) {
      const item = collection[key];
      if (predicate(item, key)) {
        return item;
      }
    }
  }
  return undefined;
}
