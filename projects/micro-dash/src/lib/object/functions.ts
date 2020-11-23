import { isFunction } from '../../public-api';
import { StringifiedKey } from '../interfaces';

/**
 * Creates an array of function property names from own enumerable properties of `object`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,503 bytes
 * - Micro-dash: 174 bytes
 */
export function functions<T extends object>(obj: T): Array<StringifiedKey<T>> {
  return Object.getOwnPropertyNames(obj).filter(
    (key) =>
      key !== 'constructor' &&
      isFunction(Object.getOwnPropertyDescriptor(obj, key)!.value),
  ) as Array<StringifiedKey<T>>;
}
