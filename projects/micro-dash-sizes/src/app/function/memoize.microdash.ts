import { memoize } from '@s-libs/micro-dash';

memoize((a: string) => a)('a');
memoize(
  (a: string) => a,
  (b: string) => b,
)('a');
