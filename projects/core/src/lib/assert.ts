/**
 * Throws an error if `condition` is falsy, and acts as a type guard.
 *
 * @param message The message to set in the error that is thrown
 *
 * ```ts
 * class ProblemLogger {
 *   problem?: string;
 *
 *   log() {
 *     assert(this.problem, "You must set problem before logging it");
 *
 *     // now typescript knows `this.problem` is truthy, so we can safely call methods on it
 *     console.log(problem.toUpperCase());
 *   }
 * }
 * ```
 */
export function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
