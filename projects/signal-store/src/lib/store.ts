import { IfCouldBe, Nil } from '@s-libs/micro-dash/lib/interfaces';

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
  update: <A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ) => void;
  mutate: <A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ) => void;
  assign: IfCouldBe<T, Nil, never, (value: Partial<T>) => void>;
}

export interface ReadonlyStore<T> {
  <K extends keyof NonNullable<T>>(
    attr: K,
  ): ReadonlyStore<IfCouldBe<T, Nil, undefined> | NonNullable<T>[K]>;

  readonly state: T;
  nonNull: Store<NonNullable<T>>;
}
