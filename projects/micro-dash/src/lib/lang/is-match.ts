import { every } from '../collection/every';
import { DeepPartial } from '../interfaces';
import { isEmpty } from './is-empty';

/**
 * Performs a partial deep comparison between `object` and `source` to determine if `object` contains equivalent property values.
 *
 * *Note:* This function is equivalent to `matches` when source is partially applied.
 *
 * Partial comparisons will match empty array and empty object source values against any array or object value, respectively.
 *
 * Differences from lodash:
 * - does not match `0` to `-0`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 12,917 bytes
 * - Micro-dash: 721 bytes
 */
export function isMatch<T>(object: T, source: DeepPartial<T>): boolean {
  return isEmpty(source) || isMatch0(object, source);
}

function isMatch0(object: any, source: any): boolean {
  if (Object.is(object, source)) {
    return true;
  }
  if (!(object instanceof Object && source instanceof Object)) {
    return false;
  }
  const isArray = Array.isArray(object);
  if (isArray !== Array.isArray(source)) {
    return false;
  }

  if (isArray) {
    const unmatched: any[] = object.slice();
    for (const innerSource of source) {
      const i = unmatched.findIndex((item) => isMatch0(item, innerSource));
      if (i < 0) {
        return false;
      }
      unmatched.splice(i, 1);
    }
    return true;
  } else {
    return every(
      source,
      (value, key) =>
        object.hasOwnProperty(key) && isMatch0(object[key], value),
    );
  }
}
