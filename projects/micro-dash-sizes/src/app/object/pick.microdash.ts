import { pick } from '@s-libs/micro-dash';

console.log(pick({ a: 1, b: 2, c: 3 }, 'a', 'c'));
console.log(pick(null, 'a'));
