import { mapKeys } from '@s-libs/micro-dash';

console.log(
  mapKeys([1], () => 1),
  mapKeys({ a: 1 }, () => 1),
);
