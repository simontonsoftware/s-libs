import { IfCouldBe, Nil } from '../interfaces';
import { getWithoutDefault } from '../object/get';

// https://stackoverflow.com/a/64776616/1836506
type First<T extends any[]> = T extends [infer U, ...any[]] ? U : never;
type Rest<T extends any[]> = T extends [any, ...infer U] ? U : never;
type PropertyAtPath<T, Path extends any[]> = First<Path> extends never
  ? T
  : First<Path> extends keyof NonNullable<T>
  ?
      | PropertyAtPath<NonNullable<T>[First<Path>], Rest<Path>>
      | IfCouldBe<T, Nil, undefined>
  : undefined;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * Differences from lodash:
 * - does not handle a dot-separated string for `path`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,261 bytes
 * - Micro-dash: 127 bytes
 */
export function property<P extends PropertyKey[]>(
  path: readonly [...P],
): <T>(object: T) => PropertyAtPath<T, P> {
  return getWithoutDefault.bind(0, path);
}
