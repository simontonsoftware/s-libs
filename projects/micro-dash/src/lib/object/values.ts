import { keys, keysOfNonArray } from './keys';

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,073 bytes
 * - Micro-dash: 186 bytes
 */
export function values<T>(object: T): Array<T[keyof T]> {
  return keys(object).map((key) => object[key as keyof T]);
}

export function valuesOfNonArray<T>(object: T): Array<T[keyof T]> {
  return keysOfNonArray(object).map((key) => object[key as keyof T]);
}
