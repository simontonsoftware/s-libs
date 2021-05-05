import reject from 'lodash-es/reject';

console.log(
  reject([1], () => true),
  reject({ a: 1 }, () => false),
);
