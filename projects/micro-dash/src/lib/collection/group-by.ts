import {
  IfIndexType,
  Key,
  Nil,
  ObjectWith,
  ValueIteratee,
} from '../interfaces';
import { transform } from '../object/transform';

/**
 * Creates an object composed of keys generated from the results of running each element of `collection` thru `iteratee`. The order of grouped values is determined by the order they occur in `collection`. The corresponding value of each key is an array of elements responsible for generating the key.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 15,138 bytes
 * - Micro-dash: 417 bytes
 */
export function groupBy<T, K extends Key>(
  collection: Nil | ObjectWith<T> | readonly T[],
  iteratee: ValueIteratee<T, K>,
): { [k in K]: IfIndexType<K, T[], T[] | undefined> } {
  return transform(
    collection as any,
    (accumulator, value: any) => {
      const key = iteratee(value);
      let group = accumulator[key];
      if (!Array.isArray(group)) {
        accumulator[key] = group = [];
      }
      group.push(value);
    },
    {} as any,
  );
}
