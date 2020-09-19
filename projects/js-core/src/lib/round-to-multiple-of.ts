/**
 * Rounds `value` to the nearest multiple of `multiple`.
 *
 * ```ts
 * roundToMultiple(5, 13); // 15
 * roundToMultiple(2, 4.8); // 4
 * roundToMultiple(3, -4); // -3
 * roundToMultiple(0.5, 1.6); // 1.5
 * ```
 */
export function roundToMultipleOf(multiple: number, value: number): number {
  return Math.round(value / multiple) * multiple;
}
