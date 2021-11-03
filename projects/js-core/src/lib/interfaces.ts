import { IfIndexType } from '../../../micro-dash/src/lib/interfaces';

export type ArrayIteratee<I, O> = (item: I, index: number) => O;
export type ObjectIteratee<T, O> = (
  item: T[keyof T],
  key: StringifiedKey<T>,
) => O;

export type StringifiedKey<T> = Cast<keyof T, string>;
type Cast<I, O> = Exclude<I, O> extends never ? I : O;

export type Nil = null | undefined;

type IndexKeys<T> = { [K in keyof T]: IfIndexType<K, K> }[keyof T];
type NonIndexKeys<T> = { [K in keyof T]: IfIndexType<K, never, K> }[keyof T];
export type PartialExceptIndexes<T> = { [K in IndexKeys<T>]: T[K] } & {
  [K in NonIndexKeys<T>]?: T[K];
};
