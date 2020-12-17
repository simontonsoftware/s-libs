import { shuffle } from '@s-libs/micro-dash';

console.log(shuffle([1, 2]), shuffle({ a: 1, b: 2 }), shuffle(null));
