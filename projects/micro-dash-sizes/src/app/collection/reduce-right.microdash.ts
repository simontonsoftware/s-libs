import { reduceRight } from '@s-libs/micro-dash';

console.log(
  reduceRight([], () => 1),
  reduceRight({ a: 1 }, (key) => key),
);
