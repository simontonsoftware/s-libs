import sampleSize from 'lodash-es/sampleSize';

console.log(
  sampleSize([1, 2], 1),
  sampleSize({ a: 1, b: 2 }, 2),
  sampleSize([1, 2, 3]),
);
