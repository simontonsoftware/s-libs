import { negate } from '@s-libs/micro-dash';

const isNotArray = negate(Array.isArray);
console.log(isNotArray(0), isNotArray([]));
