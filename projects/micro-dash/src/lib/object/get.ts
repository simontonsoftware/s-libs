import { IfCouldBe, Nil } from '../interfaces';
import { castArray, isUndefined } from '../lang';

type WithDefault<V, D> =
  | (undefined extends D ? V : Exclude<V, undefined>)
  | (undefined extends V ? D : never);

/**
 * Gets the value at `path` of `object`. If the resolved value is `undefined`, the `defaultValue` is returned in its place.
 *
 * Differences from lodash:
 * - does not handle a dot-separated string for `path`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 5,426 bytes
 * - Micro-dash: 251 bytes
 */

export function get<T, K extends keyof NonNullable<T>, D = undefined>(
  object: T,
  key: K,
  defaultValue?: D,
): IfCouldBe<T, Nil, D> | WithDefault<NonNullable<T>[K], D>;

export function get<D = undefined>(
  object: object,
  path: [],
  defaultValue?: D,
): D;
export function get<T, K1 extends keyof NonNullable<T>, D = undefined>(
  object: T,
  path: readonly [K1],
  defaultValue?: D,
): IfCouldBe<T, Nil, D> | WithDefault<NonNullable<T>[K1], D>;
export function get<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<T>[K1],
  D = undefined,
>(
  object: T,
  path: readonly [K1, K2],
  defaultValue?: D,
): IfCouldBe<T, Nil, D> | WithDefault<NonNullable<T>[K1][K2], D>;
export function get<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<T>[K1],
  K3 extends keyof NonNullable<T>[K1][K2],
  D = undefined,
>(
  object: T,
  path: readonly [K1, K2, K3],
  defaultValue?: D,
): IfCouldBe<T, Nil, D> | WithDefault<NonNullable<T>[K1][K2][K3], D>;
export function get<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<T>[K1],
  K3 extends keyof NonNullable<T>[K1][K2],
  K4 extends keyof NonNullable<T>[K1][K2][K3],
  D = undefined,
>(
  object: T,
  path: readonly [K1, K2, K3, K4],
  defaultValue?: D,
): IfCouldBe<T, Nil, D> | WithDefault<NonNullable<T>[K1][K2][K3][K4], D>;

export function get(
  object: Nil | object,
  path: readonly PropertyKey[],
  defaultValue?: any,
): any;

export function get(
  object: any,
  path: PropertyKey | readonly PropertyKey[],
  defaultValue?: any,
): any {
  const val = getWithoutDefault(path, object);
  return isUndefined(val) ? defaultValue : val;
}

export function getWithoutDefault(path: any, object: any): any {
  path = castArray(path);
  const { length } = path;
  let index = 0;
  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return !index || index < length ? undefined : object;
}
