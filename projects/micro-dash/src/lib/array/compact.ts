import { Falsey } from 'utility-types';
import { identity } from '../util';

/**
 * Creates an array with all falsey values removed. The values `false`, `null`, `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 116 bytes
 * - Micro-dash: 76 bytes
 */
export function compact<T>(array: readonly T[]): Array<Exclude<T, Falsey>> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- not sure why this rule triggers
  return array.filter(identity) as Array<Exclude<T, Falsey>>;
}
