import mapKeys from 'lodash-es/mapKeys';

console.log(
  mapKeys([1], () => 1),
  mapKeys({ a: 1 }, () => 1),
);
