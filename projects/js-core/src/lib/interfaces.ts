export type ArrayIteratee<I, O> = (item: I, index: number) => O;
export type ObjectIteratee<T, O> = (
  item: T[keyof T],
  key: StringifiedKey<T>,
) => O;

export type StringifiedKey<T> = Cast<keyof T, string>;
type Cast<I, O> = Exclude<I, O> extends never ? I : O;

export type Nil = null | undefined;
