import {
  Cast,
  Evaluate,
  IfCouldBe,
  IfIndexType,
  KeyNarrowingIteratee,
  Narrow,
  Nil,
  ObjectIteratee,
  PartialExceptIndexes,
  ValueNarrowingIteratee,
} from '../interfaces';
import { forOwn } from './for-own';

type IfDefinitelyIncluded<T, O, If, Else = never> = Exclude<T, O> extends never
  ? If
  : Else;
type IfMaybeIncluded<T, O, If, Else = never> = IfDefinitelyIncluded<
  T,
  O,
  Else,
  IfCouldBe<T, O, If, Else>
>;
type KeysWithDefinitelyIncludedValues<T, O> = {
  [K in keyof T]: IfDefinitelyIncluded<T[K], O, K>;
}[keyof T];
type KeysWithMaybeIncludedValues<T, O> = {
  [K in keyof T]: IfMaybeIncluded<T[K], O, K>;
}[keyof T];
export type DefinitelyIncludedKeys<T, O> = {
  [K in keyof T]: IfIndexType<
    K,
    IfCouldBe<O, string, IfCouldBe<K, string, Extract<O, K>, K>>,
    IfDefinitelyIncluded<Cast<K, string>, O, K>
  >;
}[keyof T];
type MaybeIncludedKeys<T, O> = {
  [K in keyof T]: IfIndexType<K, never, IfMaybeIncluded<Cast<K, string>, O, K>>;
}[keyof T];

/**
 * Creates an object composed of the `object` properties `predicate` returns truthy for.
 *
 * Differences from lodash:
 * - does not treat sparse arrays as dense
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 17,091 bytes
 * - Micro-dash: 346 bytes
 */

export function pickBy<T, O>(
  object: Nil | readonly T[],
  predicate: ValueNarrowingIteratee<T[], O>,
): Record<number, Narrow<T, O>>;
export function pickBy<T>(
  object: Nil | readonly T[],
  predicate: ObjectIteratee<T, boolean>,
): Record<number, T>;

export function pickBy<I, T extends NonNullable<I>, O>(
  object: I,
  predicate: ValueNarrowingIteratee<T, O>,
): Evaluate<
  | IfCouldBe<I, Nil, {}>
  | ({
      [K in KeysWithMaybeIncludedValues<T, O>]?: Narrow<T[K], O>;
    } & { [K in KeysWithDefinitelyIncludedValues<T, O>]: Narrow<T[K], O> })
>;
export function pickBy<I, T extends NonNullable<I>, O>(
  object: I,
  predicate: KeyNarrowingIteratee<T, O>,
): Evaluate<
  | IfCouldBe<I, Nil, {}>
  | ({
      [K in DefinitelyIncludedKeys<T, O>]: T[K];
    } & { [K in MaybeIncludedKeys<T, O>]?: T[K] })
>;
export function pickBy<T>(
  object: T,
  predicate: ObjectIteratee<T, boolean>,
): Evaluate<PartialExceptIndexes<NonNullable<T>>>;

export function pickBy<T>(
  object: T,
  predicate: ObjectIteratee<T, boolean>,
): Partial<T> {
  const obj: any = {};
  forOwn(object, (item, key) => {
    if (predicate(item, key)) {
      obj[key] = item;
    }
  });
  return obj;
}
