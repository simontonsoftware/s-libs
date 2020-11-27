/** @hidden */
export type Nil = null | undefined;
/** @hidden */
export type Primitive = boolean | number | string;
/** @hidden */
export type Key = keyof any; // TODO: replace with built-in PropertyKey
/** @hidden */
export type Existent = Primitive | object;
/** @hidden */
export type ObjectWith<T> = Record<string, T>;
/** @hidden */
export type StringifiedKey<T> = Cast<keyof T, string>;

/** @hidden */
export type ArrayIteratee<I, O> = (item: I, index: number) => O;
/** @hidden */
export type ArrayNarrowingIteratee<O> = (item: any, index: number) => item is O;
/** @hidden */
export type ObjectIteratee<T, O> = (
  item: T[keyof T],
  key: StringifiedKey<T>,
) => O;
/** @hidden */
export type ValueNarrowingIteratee<I, O> = (
  item: any,
  key: StringifiedKey<I>,
) => item is O;
/** @hidden */
export type KeyNarrowingIteratee<I, O> = (
  item: I[keyof I],
  key: any,
) => key is O;
/** @hidden */
export type ValueIteratee<T, O> = (value: T) => O;

/** @hidden */
export type Cast<I, O> = Exclude<I, O> extends never ? I : O;
/** @hidden */
export type Narrow<I, O> = Extract<I, O> | Extract<O, I>;
/** @hidden */
export type IfCouldBe<T1, T2, If, Else = never> = Narrow<T1, T2> extends never
  ? Else
  : If;
/** @hidden */
export type IfIndexType<T, If, Else = never> = string extends T
  ? If
  : number extends T
  ? If
  : Else;

/** @hidden */
type IndexKeys<T> = { [K in keyof T]: IfIndexType<K, K> }[keyof T];
/** @hidden */
type NonIndexKeys<T> = { [K in keyof T]: IfIndexType<K, never, K> }[keyof T];
/** @hidden */
export type PartialExceptIndexes<T> = { [K in IndexKeys<T>]: T[K] } &
  { [K in NonIndexKeys<T>]?: T[K] };

/** @hidden */
export type Evaluate<T> = T extends infer I ? { [K in keyof I]: T[K] } : never;

/** @hidden */
export type Drop1Arg<T extends Function> = T extends (
  arg1: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
/** @hidden */
export type Drop2Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
/** @hidden */
export type Drop3Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  arg3: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
/** @hidden */
export type Drop4Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  arg3: any,
  arg4: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
