import { IfCouldBe, Nil, Primitive } from './interfaces';

export type Slice<T, K extends keyof NonNullable<T>> = IfCouldBe<
  T,
  Nil,
  ReadonlyStore<NonNullable<T>[K] | undefined>,
  Store<NonNullable<T>[K]>
>;

export type GetSlice<T> = <K extends keyof NonNullable<T>>(
  attr: K,
) => Slice<T, K>;

export interface Store<T> extends GetSlice<T> {
  state: T;
  nonNull: Store<NonNullable<T>>;
  assign: IfCouldBe<
    T,
    any[] | Nil | Primitive,
    never,
    (value: Partial<T>) => void
  >;
  update: <A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ) => void;
  mutate: <A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ) => void;
}

export type ReadonlySlice<T, K extends keyof NonNullable<T>> = ReadonlyStore<
  IfCouldBe<T, Nil, undefined> | NonNullable<T>[K]
>;

export interface ReadonlyStore<T> {
  <K extends keyof NonNullable<T>>(attr: K): ReadonlySlice<T, K>;

  readonly state: T;
  nonNull: Store<NonNullable<T>>;
}
