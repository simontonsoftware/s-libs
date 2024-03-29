import { EmptyObject, IfCouldBe, Nil } from '../interfaces';
import { clone } from '../lang';

type RemainingKeys<T, Omits> =
  | Exclude<keyof T, Omits>
  | Extract<PropertyKey, keyof T>; // always include index properties

/**
 * The opposite of `pick`; this function creates an object composed of the own enumerable string properties of object that are not omitted.
 *
 * Differences from lodash:
 * - `paths` must be direct keys of `object` (they cannot refer to deeper properties)
 * - does not work with arrays
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 18,060 bytes
 * - Micro-dash: 161 bytes
 */
export function omit<
  T extends Nil | object,
  O extends ReadonlyArray<keyof Exclude<T, Nil>>,
>(
  object: T,
  ...paths: O
):
  | IfCouldBe<T, Nil, EmptyObject>
  | {
      [K in RemainingKeys<Exclude<T, Nil>, O[number]>]: Exclude<T, Nil>[K];
    } {
  const obj: any = clone(object) ?? {};
  for (const path of paths) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this is exactly what the user requested, so ...
    delete obj[path];
  }
  return obj;
}
