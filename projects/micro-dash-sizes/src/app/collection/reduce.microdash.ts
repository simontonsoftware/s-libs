import { reduce } from '@s-libs/micro-dash';

console.log(
  reduce([], () => 1),
  reduce({ a: 1 }, (key) => key),
);
