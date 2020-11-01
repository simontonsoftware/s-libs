import { memoize } from '@s-libs/micro-dash';

memoize((a: any) => a)('a');
memoize(
  (a: any) => a,
  (b: any) => b,
)('a');
