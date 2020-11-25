import { IfCouldBe, Nil } from '../interfaces';

/**
 * Creates an object composed of the picked `object` properties.
 *
 * Differences from lodash:
 * - `paths` must be direct properties of `object` (they cannot references deep properties)
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 7,718 bytes
 * - Micro-dash: 142 bytes
 */
export function pick<T, P extends Array<keyof NonNullable<T>>>(
  object: T,
  ...paths: P
): { [K in P[number]]: NonNullable<T>[K] } | IfCouldBe<T, Nil, {}> {
  const result: any = {};
  if (object != null) {
    for (const path of paths) {
      result[path] = object[path as keyof T];
    }
  }
  return result;
}
