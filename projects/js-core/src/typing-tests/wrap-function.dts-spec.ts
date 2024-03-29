import { noop } from '@s-libs/micro-dash';
import { wrapFunction } from '../public-api';

class O {
  id = 1;
}
function f(this: O, _a1: string, _a2: Date): number {
  return 1;
}

// $ExpectType (this: unknown) => void
wrapFunction(noop, {});
// $ExpectType (this: O, _a1: string, _a2: Date) => number
wrapFunction(f, {
  // $ExpectType (this: O, _a1: string, _a2: Date) => void
  before(_a1, _a2): void {},
  // $ExpectType (this: O, orig: (_a1: string, _a2: Date) => number, _a1: string, _a2: Date) => number
  around(orig, _a1, _a2): number {
    return 1;
  },
  // $ExpectType (this: O, _r: number, _a1: string, _a2: Date) => number
  transform(_r, _a1, _a2): number {
    return 1;
  },
  // $ExpectType (this: O, _r: number, _a1: string) => void
  after(_r, _a1): void {},
});
