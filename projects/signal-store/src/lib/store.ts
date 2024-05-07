import { IfCouldBe, Nil } from '@s-libs/micro-dash/lib/interfaces';
import { expectTypeOf } from 'expect-type';

export type Slice<T, K extends keyof NonNullable<T>> = IfCouldBe<
  T,
  Nil,
  ReadonlyStore<NonNullable<T>[K] | undefined>,
  IfCouldBe<
    NonNullable<T>[K],
    undefined,
    DeletableStore<NonNullable<T>[K]>,
    Store<NonNullable<T>[K]>
  >
>;

export type GetSlice<T> = <K extends keyof NonNullable<T>>(
  attr: K,
) => Slice<T, K>;

export interface Store<T> extends GetSlice<T> {
  nonNull: Store<NonNullable<T>>;
  state: T; // TODO: try Readonly<T>, or DeepReadonly<T>
  assign: (value: Partial<T>) => void;
  update: <A extends any[]>(
    func: (state: T, ...args: A) => T,
    ...args: A
  ) => void;
  mutate: <A extends any[]>(
    func: (state: T, ...args: A) => void,
    ...args: A
  ) => void;
}

export interface DeletableStore<T> extends Store<T> {
  delete: () => void;
}

export interface ReadonlyStore<T> {
  <K extends keyof T>(attr: K): ReadonlyStore<T[K]>;

  readonly state: T; // TODO: try Readonly<T>, or DeepReadonly<T>
}

let store!: Store<{ ary: boolean[]; deletable?: boolean[] }>;
const deletable = store('deletable');
expectTypeOf(deletable).toEqualTypeOf<DeletableStore<boolean[] | undefined>>();
expectTypeOf(deletable(0)).toEqualTypeOf<ReadonlyStore<boolean | undefined>>();
expectTypeOf(deletable.mutate)
  .parameter(0)
  .parameter(0)
  .toEqualTypeOf<boolean[] | undefined>();
