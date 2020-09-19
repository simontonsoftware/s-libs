/** @hidden */
export interface CallableObject<F extends (...args: any[]) => any> {
  // tslint:disable-next-line:callable-types
  (...args: Parameters<F>): ReturnType<F>;
}

/**
 * Extend this for classes whose objects are directly callable.
 *
 * ```ts
 * class Multiplier extends CallableObject<(value: number) => number> {
 *   constructor(public factor: number) {
 *     super((value: number) => value * this.factor);
 *   }
 * }
 *
 * const doubler = new Multiplier(2);
 * doubler(2); // 4
 * doubler.factor = 3;
 * doubler(2); // 6
 * ```
 */
export abstract class CallableObject<F extends (...args: any[]) => any> {
  constructor(callAction: F) {
    return Object.setPrototypeOf(callAction, new.target.prototype);
  }
}
