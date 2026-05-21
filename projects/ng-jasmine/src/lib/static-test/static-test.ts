/**
 * Use this when you want to write test code that doesn't actually run, instead relying only on your static tools like Typescript or a linter to raise errors.
 *
 * ```ts
 * function reject<T>(array: T[], predicate: (value: T) => boolean): T[] {
 *   return array.filter((value) => !predicate(value));
 * }
 *
 * it('requires the predicate type to match the array type', () => {
 *   staticTest(() => {
 *     // @ts-expect-error -- mismatch of number array w/ string function
 *     reject([1, 2, 3], (value: string) => value === '2');
 *   });
 * }); * ```
 */
export function staticTest(_test: VoidFunction): void {
  expect().nothing();
}
