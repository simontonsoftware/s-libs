import { reduceRight } from '@s-libs/micro-dash';

reduceRight([], () => {});
reduceRight({ a: 1 }, (key) => key);
