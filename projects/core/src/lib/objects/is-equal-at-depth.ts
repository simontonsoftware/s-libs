import { keys } from 'micro-dash';

/**
 * Performs a deep comparison between two values to determine if they are equivalent, up to the given depth. Once that depth is reached, remaining values are compared using `Object.is()`.
 *
 * ```ts
 * let object1 = "a";
 * let object2 = "a";
 * isEqualAtDepth(0, object1, object2); // true
 * isEqualAtDepth(1, object1, object2); // true
 *
 * let object1 = { a: 1 };
 * let object2 = { a: 1 };
 * isEqualAtDepth(0, object1, object2); // false
 * isEqualAtDepth(1, object1, object2); // true
 *
 * object1 = { a: [1, 2, 3], d: { e: 1 } };
 * object2 = { a: [1, 2, 3], d: { e: 1 } };
 * isEqualAtDepth(0, object1, object2); // false
 * isEqualAtDepth(1, object1, object2); // false
 * isEqualAtDepth(2, object1, object2); // true
 * isEqualAtDepth(3, object1, object2); // true
 * ```
 */
export function isEqualAtDepth(depth: number, value: any, other: any): boolean {
  if (Object.is(value, other)) {
    // covers e.g. NaN === NaN
    return true;
  }
  if (depth === 0 || !(value instanceof Object && other instanceof Object)) {
    return false;
  }
  return hasSameValues(depth, value, other);
}

/** @hidden */
function hasSameValues(depth: number, value: any, other: any): boolean {
  for (const key of keys(value)) {
    if (!other.hasOwnProperty(key)) {
      return false;
    }
  }
  for (const key of keys(other)) {
    if (!isEqualAtDepth(depth - 1, value[key], other[key])) {
      return false;
    }
  }
  return true;
}
