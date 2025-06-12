export interface CallableObject<F extends (...args: any[]) => any> {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type -- this is a special kind of class
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
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- this is a special kind of class
export abstract class CallableObject<F extends (...args: any[]) => any> {
  constructor(callAction: F) {
    // eslint-disable-next-line no-constructor-return -- this is the whole point!
    return Object.setPrototypeOf(callAction, new.target.prototype);
  }
}
