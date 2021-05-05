import { reject } from '@s-libs/micro-dash';

console.log(
  reject([1], () => true),
  reject({ a: 1 }, () => false),
);
