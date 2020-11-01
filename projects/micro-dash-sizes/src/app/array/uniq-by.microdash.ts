import { uniqBy } from '@s-libs/micro-dash';

console.log(uniqBy([1, 1, 2], (v) => v));
