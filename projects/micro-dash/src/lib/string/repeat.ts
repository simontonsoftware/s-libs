/**
 * Repeats the given string `n` times.
 *
 * Differences from lodash:
 * - does not work as an iteratee for methods like `map`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 2,491 bytes
 * - Micro-dash: 87 bytes
 */
export function repeat(string: string, n: number): string {
  return n < 0 ? '' : new Array(n | 0).fill(string).join('');
}
