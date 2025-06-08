import { Falsy } from '../interfaces';
import { identity } from '../util';

/**
 * Creates an array with all falsey values removed. The values `false`, `null`, `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 113 bytes
 * - Micro-dash: 62 bytes
 */
export function compact<T>(array: readonly T[]): Array<Exclude<T, Falsy>> {
  return array.filter(identity) as Array<Exclude<T, Falsy>>;
}
