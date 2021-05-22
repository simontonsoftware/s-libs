import reduce from 'lodash-es/reduce';

console.log(
  reduce([], () => 1),
  reduce({ a: 1 }, (key) => key),
);
