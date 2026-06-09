export type Nil = null | undefined;
export type Primitive = boolean | number | string;
export type Key = number | string;

export type IfContainsAnyOf<T1, T2, If, Else = never> =
  Extract<T1, T2> extends never ? Else : If;
