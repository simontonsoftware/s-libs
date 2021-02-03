import { negate } from '../../lib/function';

// $ExpectType (this: unknown, arg: any) => boolean
negate(Array.isArray);

declare const boundFn: (
  this: Date,
  arg1: string,
  arg2: 'hi',
  ...rest: number[]
) => Date;
// $ExpectType (this: Date, arg1: string, arg2: "hi", ...rest: number[]) => boolean
negate(boundFn);
