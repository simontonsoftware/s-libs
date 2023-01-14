import memoize from 'lodash-es/memoize';

memoize((a: string) => a)('a');
memoize(
  (a: string) => a,
  (b: string) => b,
)('a');
