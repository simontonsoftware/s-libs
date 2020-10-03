import { Subscription } from 'rxjs';
import { RootStore } from '../lib/root-store';
import { DeepState, runDeep, subscribeDeep } from './deep-performance';
import { runWide, subscribeWide, WideState } from './wide-performance';

const depth = 1000;
const deepIterations = 100;
const msPerDeepSubscription = 1;
const msPerDeepIteration = 5;
const msPerDeepUnsubscribe = 1;

const width = 10000;
const wideIterations = 100;
const msPerWideSubscription = 1;
const msPerWideIteration = 5;
const msPerWideUnsubscribe = 1;

describe('performance', () => {
  it('is good with a deep state', () => {
    const store = new RootStore(new DeepState(depth));

    const { elapsed: timeToSubscribe, subscription } = subscribeDeep(store);
    const timeToChange = runDeep(store, deepIterations);
    const timeToUnsubscribe = unsubscribe(subscription, depth);

    expect(timeToSubscribe / depth).toBeLessThan(msPerDeepSubscription);
    expect(timeToChange / deepIterations).toBeLessThan(msPerDeepIteration);
    expect(timeToUnsubscribe / depth).toBeLessThan(msPerDeepUnsubscribe);
  });

  it('is good with a wide state', () => {
    const store = new RootStore(new WideState(width));

    const { elapsed: timeToSubscribe, subscription } = subscribeWide(store);
    const timeToChange = runWide(store, wideIterations);
    const timeToUnsubscribe = unsubscribe(subscription, width);

    expect(timeToSubscribe / width).toBeLessThan(msPerWideSubscription);
    expect(timeToChange / wideIterations).toBeLessThan(msPerWideIteration);
    expect(timeToUnsubscribe / width).toBeLessThan(msPerWideUnsubscribe);
  });
});

function unsubscribe(subscription: Subscription, count: number): number {
  const start = new Date().getTime();
  subscription.unsubscribe();
  const elapsed = new Date().getTime() - start;

  console.log('ms to unsubscribe', elapsed);
  console.log(' - per subscription', elapsed / count);
  return elapsed;
}
