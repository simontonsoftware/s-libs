import partition from 'lodash-es/partition';

console.log(
  partition([1], () => {}),
  partition({ a: 1 }, () => {}),
);
