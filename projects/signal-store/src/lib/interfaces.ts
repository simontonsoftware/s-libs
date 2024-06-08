export type Nil = null | undefined;
export type Primitive = boolean | number | string;

export type Narrow<I, O> = Extract<I, O> | Extract<O, I>;
export type IfCouldBe<T1, T2, If, Else = never> =
  Narrow<T1, T2> extends never ? Else : If;
