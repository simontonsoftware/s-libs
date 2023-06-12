import { flatten } from './flatten';

/**
 * Creates an array of unique values, in order, from all given `arrays`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 6,792 bytes
 * - Micro-dash: 206 bytes
 */
export function union<T>(...arrays: readonly T[][]): T[] {
  return Array.from(new Set(flatten(arrays)));
}
