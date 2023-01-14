/**
 * Checks if `value` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).
 */
export function isTruthy(value: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- we consolidate all linting errors to this helper :)
  return !!value;
}
