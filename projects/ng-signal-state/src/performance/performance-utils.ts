import { EnvironmentInjector } from '@angular/core';

export function unsubscribe(
  count: number,
  injector: EnvironmentInjector,
): number {
  const start = performance.now();
  injector.destroy();
  const elapsed = performance.now() - start;

  console.log('ms to unsubscribe', elapsed);
  console.log(' - per subscription', elapsed / count);
  return elapsed;
}
