import { OperatorFunction } from 'rxjs';
import { scan } from 'rxjs/operators';

/**
 * Emits the upstream value as the first element in an array, followed by the last `count` values in reverse chronological order.
 *
 * ```
 * source:         -1----2------3--------4--------5--------|
 * withHistory(2): -[1]--[2,1]--[3,2,1]--[4,3,2]--[5,4,3]--|
 * withHistory(0): -[1]--[2]----[3]------[4]------[5]------|
 * ```
 */
export function withHistory<T>(count: number): OperatorFunction<T, T[]> {
  return scan<T, T[]>((buf, value) => [value, ...buf.slice(0, count)], []);
}
