import { IfCouldBe, Nil } from '@s-libs/micro-dash/lib/interfaces';
import { expectTypeOf } from 'expect-type';

type WritableSlice<T> = IfCouldBe<
  T,
  undefined,
  DeletableStore<T>,
  IfCouldBe<T, null, NullableStore<T>, NonNullableStore<T>>
>;

export type Slice<T, K extends keyof NonNullable<T>> = IfCouldBe<
  T,
  Nil,
  ReadonlyStore<NonNullable<T>[K] | undefined>,
  WritableSlice<NonNullable<T>[K]>
>;

export type GetSlice<T> = <K extends keyof NonNullable<T>>(
  attr: K,
) => Slice<T, K>;

interface WritableStore<T> {
  state: T; // TODO: try Readonly<T>, or DeepReadonly<T>
  update: <A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ) => void;
  mutate: <A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ) => void;
}

export interface NonNullableStore<T> extends WritableStore<T> {
  <K extends keyof T>(attr: K): Slice<T, K>;
  assign: (value: Partial<T>) => void;
}

export interface NullableStore<T> extends WritableStore<T> {
  <K extends keyof NonNullable<T>>(
    attr: K,
  ): ReadonlyStore<NonNullable<T>[K] | undefined>;
  nonNull: NonNullableStore<NonNullable<T>>;
}

export interface DeletableStore<T> extends NullableStore<T> {
  delete: () => void;
}

export interface ReadonlyStore<T> {
  <K extends keyof T>(attr: K): ReadonlyStore<T[K]>;

  readonly state: T; // TODO: try Readonly<T>, or DeepReadonly<T>
}

let store!: NonNullableStore<{ ary: boolean[]; deletable?: boolean[] }>;
const deletable = store('deletable');
expectTypeOf(deletable).toEqualTypeOf<DeletableStore<boolean[] | undefined>>();
expectTypeOf(deletable(0)).toEqualTypeOf<ReadonlyStore<boolean | undefined>>();
expectTypeOf(deletable.mutate)
  .parameter(0)
  .parameter(0)
  .toEqualTypeOf<boolean[] | undefined>();
