export type Func = (...args: any[]) => any;

export type ResolveType<F> = F extends (...args: any[]) => Promise<infer U>
  ? U
  : never;
