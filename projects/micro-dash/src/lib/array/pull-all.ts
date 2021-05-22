import { remove } from './remove';

/**
 * This method is like `pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `difference`, this method mutates array.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 825 bytes
 * - Micro-dash: 181 bytes
 */
export function pullAll<T>(array: T[], values: T[]): T[] {
  for (const value of values.slice()) {
    remove(array, (item: T) => Object.is(item, value));
  }
  return array;
}
// TODO: return type could be narrower?
