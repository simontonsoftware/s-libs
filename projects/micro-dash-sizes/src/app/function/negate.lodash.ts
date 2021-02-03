import negate from 'lodash-es/negate';

const isNotArray = negate(Array.isArray);
console.log(isNotArray(0), isNotArray([]));
