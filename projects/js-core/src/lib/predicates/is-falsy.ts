/**
 * Checks if `value` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).
 */
export function isFalsy(value: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- we consolidate all linting errors to this helper :)
  return !value;
}
