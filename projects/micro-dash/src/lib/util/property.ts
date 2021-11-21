import { IfCouldBe, Nil } from '../interfaces';
import { getWithoutDefault } from '../object/get';

type PropertyAtPath<T, Path extends readonly any[]> = Path extends []
  ? T
  : Path extends readonly [infer First, ...infer Rest]
  ? First extends keyof NonNullable<T>
    ? IfCouldBe<T, Nil, undefined> | PropertyAtPath<NonNullable<T>[First], Rest>
    : undefined
  : unknown;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * Differences from lodash:
 * - does not handle a dot-separated string for `path`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,459 bytes
 * - Micro-dash: 201 bytes
 */

export function property<K extends PropertyKey>(
  key: K,
): <T>(object: T) => PropertyAtPath<T, [K]>;
export function property<P extends PropertyKey[]>(
  path: readonly [...P],
): <T>(object: T) => PropertyAtPath<T, P>;

export function property(path: any): any {
  return getWithoutDefault.bind(0, path);
}
