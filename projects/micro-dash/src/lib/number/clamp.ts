/**
 * Clamps `number` within the inclusive lower and upper bounds.
 *
 * Differences from lodash:
 * - `lower` is required
 * - does not coerce bounds that are `NaN` to be `0`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 1,652 bytes
 * - Micro-dash: 108 bytes
 */
export function clamp(number: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, number));
}
