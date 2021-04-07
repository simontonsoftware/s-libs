import {
  Cast,
  Evaluate,
  IfCouldBe,
  IfIndexType,
  KeyNarrowingIteratee,
  Nil,
  ObjectIteratee,
  PartialExceptIndexes,
  ValueNarrowingIteratee,
} from '../interfaces';
import { pickBy } from './pick-by';

/** @hidden */
type IfDefinitelyIncluded<T, O, If, Else = never> = IfCouldBe<T, O, Else, If>;
/** @hidden */
type IfMaybeIncluded<T, O, If, Else = never> = IfDefinitelyIncluded<
  T,
  O,
  Else,
  Exclude<T, O> extends never ? Else : If
>;
/** @hidden */
type KeysWithDefinitelyIncludedValues<T, O> = {
  [K in keyof T]: IfDefinitelyIncluded<T[K], O, K>;
}[keyof T];
/** @hidden */
type KeysWithMaybeIncludedValues<T, O> = {
  [K in keyof T]: IfMaybeIncluded<T[K], O, K>;
}[keyof T];
/** @hidden */
type DefinitelyIncludedKeys<T, O> = {
  [K in keyof T]: IfIndexType<
    K,
    Exclude<string, O> extends never ? never : K,
    IfDefinitelyIncluded<Cast<K, string>, O, K>
  >;
}[keyof T];
/** @hidden */
type MaybeIncludedKeys<T, O> = {
  [K in keyof T]: IfIndexType<K, never, IfMaybeIncluded<Cast<K, string>, O, K>>;
}[keyof T];

/**
 * The opposite of `pickBy`; this method creates an object composed of the own enumerable string keyed properties of `object` that `predicate` doesn't return truthy for.
 *
 * Differences from lodash:
 * - does not treat sparse arrays as dense
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 15,119 bytes
 * - Micro-dash: 368 bytes
 */

export function omitBy<T, O>(
  object: readonly T[] | Nil,
  predicate: ValueNarrowingIteratee<T[], O>,
): { [index: number]: Exclude<T, O> };
export function omitBy<T>(
  object: readonly T[] | Nil,
  predicate: ObjectIteratee<T, boolean>,
): { [index: number]: T };

export function omitBy<I, T extends NonNullable<I>, O>(
  object: I,
  predicate: ValueNarrowingIteratee<T, O>,
): Evaluate<
  | ({ [K in KeysWithDefinitelyIncludedValues<T, O>]: Exclude<T[K], O> } &
      { [K in KeysWithMaybeIncludedValues<T, O>]?: Exclude<T[K], O> })
  | IfCouldBe<I, Nil, {}>
>;
export function omitBy<I, T extends NonNullable<I>, O>(
  object: I,
  predicate: KeyNarrowingIteratee<T, O>,
): Evaluate<
  | ({
      [K in DefinitelyIncludedKeys<T, O>]: T[K];
    } &
      { [K in MaybeIncludedKeys<T, O>]?: T[K] })
  | IfCouldBe<I, Nil, {}>
>;
export function omitBy<T>(
  object: T,
  predicate: ObjectIteratee<T, boolean>,
): Evaluate<PartialExceptIndexes<NonNullable<T>>>;

export function omitBy(object: any, predicate: Function): any {
  return pickBy(object, (item, key) => !predicate(item, key));
}
