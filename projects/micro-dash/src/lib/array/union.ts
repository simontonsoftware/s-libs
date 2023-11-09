import { flatten } from './flatten';

/**
 * Creates an array of unique values, in order, from all given `arrays`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 7,561 bytes
 * - Micro-dash: 181 bytes
 */
export function union<T>(...arrays: readonly T[][]): T[] {
  return Array.from(new Set(flatten(arrays)));
}
