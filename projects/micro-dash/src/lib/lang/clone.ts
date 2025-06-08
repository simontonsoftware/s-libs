/**
 * Creates a shallow clone of `value`.
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 14,214 bytes
 * - Micro-dash: 97 bytes
 */
export function clone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.slice() as any;
  } else if (value instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return { ...value };
  } else {
    return value;
  }
}
