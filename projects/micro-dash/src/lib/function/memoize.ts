import { identity } from '../util/identity';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is provided, it determines the cache key for storing the result based on the arguments provided to the memoized function. By default, the first argument provided to the memoized function is used as the map cache key. The `func` is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized function.
 *
 * Differences from lodash:
 * - does not coerce keys to a string; any object can be used as in an ES6 `Map`
 * - does not let you customize cache creation
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 4,523 bytes
 * - Micro-dash: 231 bytes
 *
 * @param resolver The function to resolve the cache key.
 */
export function memoize<T extends Function>(
  func: T,
  resolver: Function = identity,
): T & { cache: Map<any, any> } {
  function memoized(this: any): any {
    const { cache } = memoized;
    const key = resolver.apply(this, arguments);
    if (cache.has(key)) {
      return cache.get(key);
    } else {
      const value = func.apply(this, arguments);
      cache.set(key, value);
      return value;
    }
  }
  memoized.cache = new Map();
  return memoized as any;
}
