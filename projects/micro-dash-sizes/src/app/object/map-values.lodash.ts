import mapValues from 'lodash-es/mapValues';

console.log(
  mapValues({ a: 1 }, () => 1),
  mapValues([1], () => 1),
);
