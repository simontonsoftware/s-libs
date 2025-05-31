import { forEach } from '../collection';
import { UnionToIntersection } from '../interfaces';
import { clone } from '../lang';

type Mergeable<O> = {
  [K in keyof O]?: O[K] extends object ? Mergeable<O[K]> : O[K];
} & object;

/**
 * Recursively merges own enumerable string keyed properties of source objects into the destination object. Object properties are merged recursively. Source objects are applied from left to right. Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This function mutates `object`.
 *
 * Differences from lodash:
 * - will overwrite a value with `undefined`
 * - only supports arguments that are objects
 * - cannot handle circular references
 * - when merging an array onto a non-array, the result is a non-array
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 11,996 bytes
 * - Micro-dash: 426 bytes
 */
export function merge<O extends object, S extends Array<Mergeable<O>>>(
  object: O,
  ...sources: S
): UnionToIntersection<O | S[number]> {
  for (const source of sources) {
    forEach<any>(source, (value, key) => {
      const myValue = (object as any)[key];
      if (myValue instanceof Object) {
        value = merge(clone(myValue), value);
      }
      (object as any)[key] = value;
    });
  }
  return object as any;
}
