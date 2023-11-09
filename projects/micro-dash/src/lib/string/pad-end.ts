/**
 * Pads `string` on the right side if it's shorter than `length`. Padding characters are truncated if they exceed `length`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,169 bytes
 * - Micro-dash: 68 bytes
 */
export function padEnd(s: string, length: number, chars?: string): string {
  return s.padEnd(length, chars);
}
