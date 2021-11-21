/**
 * Pads `string` on the left and right sides if it's shorter than `length`. Padding characters are truncated if they can't be evenly divided by `length`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 3,695 bytes
 * - Micro-dash: 126 bytes
 */
export function pad(s: string, length: number, chars?: string): string {
  return s
    .padStart(length - (length - s.length) / 2, chars)
    .padEnd(length, chars);
}
