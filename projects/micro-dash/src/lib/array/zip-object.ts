import { transform } from '../object';

/**
 * This function is like `fromPairs` except that it accepts two arrays, one of property identifiers and one of corresponding values.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 2,252 bytes
 * - Micro-dash: 349 bytes
 */

export function zipObject<
  K extends readonly [PropertyKey],
  V extends readonly [any, ...any[]],
>(props: K, values: V): Record<K[0], V[0]>;
export function zipObject<
  K extends readonly [PropertyKey, PropertyKey],
  V extends readonly [any, any, ...any[]],
>(props: K, values: V): Record<K[0], V[0]> & Record<K[1], V[1]>;
export function zipObject<
  K extends readonly [PropertyKey, PropertyKey, PropertyKey],
  V extends readonly [any, any, any, ...any[]],
>(
  props: K,
  values: V,
): Record<K[0], V[0]> & Record<K[1], V[1]> & Record<K[2], V[2]>;
export function zipObject<
  K extends readonly [PropertyKey, PropertyKey, PropertyKey, PropertyKey],
  V extends readonly [any, any, any, any, ...any[]],
>(
  props: K,
  values: V,
): Record<K[3], V[3]> &
  Record<K[0], V[0]> &
  Record<K[1], V[1]> &
  Record<K[2], V[2]>;
export function zipObject<K extends PropertyKey, V>(
  props: readonly K[],
  values: readonly V[],
): Record<K, V | undefined>;

export function zipObject(
  props: readonly PropertyKey[],
  values: readonly any[],
): any {
  return transform(props, (accumulator: any, prop, index) => {
    accumulator[prop] = values[index];
  });
}
