import { Subscription } from 'rxjs';

export function unsubscribe(subscription: Subscription, count: number): number {
  const start = performance.now();
  subscription.unsubscribe();
  const elapsed = performance.now() - start;

  console.log('ms to unsubscribe', elapsed);
  console.log(' - per subscription', elapsed / count);
  return elapsed;
}
