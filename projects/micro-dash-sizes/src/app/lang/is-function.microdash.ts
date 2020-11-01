import { isFunction } from '@s-libs/micro-dash';

console.log(isFunction('a'));
console.log(isFunction(() => {}));
