/** @hidden */
export type ArrayIteratee<I, O> = (item: I, index: number) => O;
/** @hidden */
export type ObjectIteratee<T, O> = (
  item: T[keyof T],
  key: StringifiedKey<T>,
) => O;

/** @hidden */
export type StringifiedKey<T> = Cast<keyof T, string>;
/** @hidden */
type Cast<I, O> = Exclude<I, O> extends never ? I : O;

/** @hidden */
export type Nil = null | undefined;
