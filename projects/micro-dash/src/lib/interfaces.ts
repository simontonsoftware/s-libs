// aliases
export type Nil = null | undefined;
export type Primitive = boolean | number | string;
export type Existent = Primitive | object;
export type Falsy = '' | 0 | false | null | undefined;
export type EmptyObject = Record<string, never>;
export type ObjectWith<T> = Record<string, T>;

// iteratees
export type ArrayIteratee<I, O> = (item: I, index: number) => O;
export type ArrayNarrowingIteratee<O> = (item: any, index: number) => item is O;
export type ObjectIteratee<T, O> = (
  item: T[keyof T],
  key: StringifiedKey<T>,
) => O;
export type ValueNarrowingIteratee<I, O> = (
  item: any,
  key: StringifiedKey<I>,
) => item is O;
export type KeyNarrowingIteratee<I, O> = (
  item: I[keyof I],
  key: any,
) => key is O;
export type ValueIteratee<T, O> = (value: T) => O;

// coercion
export type Cast<I, O> = Exclude<I, O> extends never ? I : O;
export type Narrow<I, O> = Extract<I, O> | Extract<O, I>;
export type IfCouldBe<T1, T2, If, Else = never> = Narrow<T1, T2> extends never
  ? Else
  : If;
export type IfIndexType<T, If, Else = never> = string extends T
  ? If
  : number extends T
  ? If
  : Else;

// object parts
type IndexKeys<T> = { [K in keyof T]: IfIndexType<K, K> }[keyof T];
type NonIndexKeys<T> = { [K in keyof T]: IfIndexType<K, never, K> }[keyof T];
export type PartialExceptIndexes<T> = {
  [K in NonIndexKeys<T>]?: T[K];
} & { [K in IndexKeys<T>]: T[K] };
export type StringifiedKey<T> = Cast<keyof T, string>;
export type ValuesType<T> = T extends readonly []
  ? T[number]
  : T extends ArrayLike<any>
  ? T[number]
  : T extends object
  ? T[keyof T]
  : never;
export type DeepPartial<T> = T extends Array<infer E>
  ? Array<DeepPartial<E>>
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T | undefined;

// misc
export type Evaluate<T> = T extends infer I ? { [K in keyof I]: T[K] } : never;

// very special-case
export type Drop1Arg<T extends Function> = T extends (
  arg1: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
export type Drop2Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
export type Drop3Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  arg3: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
export type Drop4Args<T extends Function> = T extends (
  arg1: any,
  arg2: any,
  arg3: any,
  arg4: any,
  ...rest: infer A
) => infer R
  ? (...rest: A) => R
  : never;
