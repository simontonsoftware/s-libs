import reduceRight from 'lodash-es/reduceRight';

console.log(
  reduceRight([], () => 1),
  reduceRight({ a: 1 }, (key) => key),
);
