/**
 * Checks if `value` is the [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types) of `Object`. _(e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)_
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 127 bytes
 * - Micro-dash: 85 bytes
 */
export function isObject(value: any): value is object {
  return value instanceof Object;
}
