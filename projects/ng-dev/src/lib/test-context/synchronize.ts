import { tick } from '@angular/core/testing';
import { isPromiseLike } from '@s-libs/js-core';
import { get, isObject } from '@s-libs/micro-dash';

/**
 * @deprecated This is no longer used with the new {@link AngularContextNext}, so it will be removed from this library at the same time as {@link AngularContext} in the future.
 *
 * The type for component harness used in an `AngularContext`, which wraps the original harness in a proxy meant to be used in a `fakeAsync` test where one cannot `await` the results of an asynchronous call. The functions that would normally return a promise instead return their result immediately, calling `tick()` to flush it first.
 */
export type Synchronized<O extends object> = {
  [K in keyof O]: O[K] extends (...args: any[]) => any
    ? SynchronizedFunction<O[K]>
    : O[K];
};

/** @hidden */
type SynchronizedFunction<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => SynchronizedResult<ReturnType<F>>;
/** @hidden */
type SynchronizedResult<V> = V extends PromiseLike<any>
  ? SynchronizedPromise<V>
  : V extends object
  ? Synchronized<V>
  : V;
/** @hidden */
type SynchronizedPromise<P> = P extends PromiseLike<infer R>
  ? R extends object
    ? Synchronized<R>
    : R
  : 'assertion error';

/** @hidden */
const proxyTarget = Symbol('proxy target'); // trick from https://stackoverflow.com/a/53431924/1836506
/** @hidden */
export function synchronize<T extends object>(obj: T): Synchronized<T> {
  return new Proxy(obj, {
    get(target, p, receiver): any {
      if (p === proxyTarget) {
        return obj;
      } else {
        return synchronizeAny(Reflect.get(target, p, receiver));
      }
    },
    apply(target, thisArg, argArray): any {
      thisArg = get(thisArg, [proxyTarget], thisArg);
      return synchronizeAny(
        Reflect.apply(target as Function, thisArg, argArray),
      );
    },
  }) as Synchronized<T>;
}

/** @hidden */
function synchronizeAny(value: any): any {
  if (isPromiseLike(value)) {
    return synchronizePromise(value);
  } else if (isObject(value)) {
    return synchronize(value);
  } else {
    return value;
  }
}

/** @hidden */
function synchronizePromise<T extends PromiseLike<any>>(promise: T): any {
  let awaited: any;
  promise.then((value) => (awaited = value));
  tick();
  // TODO: a nice error if the promise didn't resolve
  return synchronizeAny(awaited);
}
