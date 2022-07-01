import { IfCouldBe, Nil } from '../interfaces';

/**
 * Creates an object composed of the picked `object` properties.
 *
 * Differences from lodash:
 * - `paths` must be direct properties of `object` (they cannot references deep properties)
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 8,283 bytes
 * - Micro-dash: 149 bytes
 */
export function pick<T, P extends ReadonlyArray<keyof NonNullable<T>>>(
  object: T,
  ...paths: P
): IfCouldBe<T, Nil, {}> | { [K in P[number]]: NonNullable<T>[K] } {
  const result: any = {};
  if (object != null) {
    for (const path of paths) {
      result[path] = object[path as keyof T];
    }
  }
  return result;
}
