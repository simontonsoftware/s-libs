import { mapValues } from '@s-libs/micro-dash';

console.log(
  mapValues({ a: 1 }, () => 1),
  mapValues([1], () => 1),
);
