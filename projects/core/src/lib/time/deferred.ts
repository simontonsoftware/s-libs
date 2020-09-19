import { wrapFunction } from '../functions/wrap-function';

/**
 * An object you can use to create a promise and resolve/reject it later.
 *
 * ```ts
 * const deferred = new Deferred<string>();
 *
 * // later
 * deferred.resolve('a nice value'); // causes `deferred.promise` to resolve
 *
 * // or
 * deferred.reject('a bad value'); // causes `deferred.promise` to reject
 * ```
 */
export class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: PromiseLike<T> | T) => void;
  reject!: (reason?: any) => void;

  private pending = true;

  constructor() {
    const hooks = {
      before: () => {
        this.pending = false;
      },
    };
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = wrapFunction(resolve, hooks);
      this.reject = wrapFunction(reject, hooks);
    });
  }

  isPending(): boolean {
    return this.pending;
  }
}
