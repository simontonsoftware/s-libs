import { IfCouldBe, Nil } from '../interfaces';
import { isFunction } from '../lang';
import { get } from './get';

type Invoked<Func, Args> =
  NonNullable<Func> extends (...args: infer Params) => infer Ret
    ? IfCouldBe<Args, Params, Ret> | IfCouldBe<Func, Nil, undefined>
    : undefined;

type Invoke<
  T,
  Path extends readonly PropertyKey[],
  Args extends any[],
> = Path extends readonly []
  ? Invoked<T, Args>
  : Path extends readonly [
        infer K extends keyof NonNullable<T>,
        ...infer R extends PropertyKey[],
      ]
    ? Invoke<NonNullable<T>[K], R, Args> | IfCouldBe<T, Nil, undefined>
    : any;

/**
 * Invokes the method at `path` of `object`.
 *
 * Differences from lodash:
 * - only accepts an array for `path`, not a dot-separated string
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 7,407 bytes
 * - Micro-dash: 389 bytes
 */
export function invoke<
  T extends object | Nil,
  const Path extends readonly PropertyKey[],
  Args extends any[],
>(object: T, path: Path, ...args: Args): Invoke<T, Path, Args> {
  const fn = get(object, path);
  if (isFunction(fn)) {
    return fn.apply(
      path.length === 1 ? object : get(object, path.slice(0, -1)),
      args,
    );
  }
  return undefined as any;
}
