import { random, times } from '@s-libs/micro-dash';

/**
 * Generates a string of random characters of the specified length.
 */
export function randomString(length: number): string {
  return times(length, () => random(35).toString(36)).join('');
}
