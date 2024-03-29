/**
 * Pads `string` on the left side if it's shorter than `length`. Padding characters are truncated if they exceed `length`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,169 bytes
 * - Micro-dash: 70 bytes
 */
export function padStart(s: string, length: number, chars?: string): string {
  return s.padStart(length, chars);
}
