import { partition } from '@s-libs/micro-dash';

console.log(
  partition([1], () => {}),
  partition({ a: 1 }, () => {}),
);
