import { RootStore } from '../lib/root-store';
import { DeepState, runDeep, subscribeDeep } from './deep-performance';
import { unsubscribe } from './performance-utils';
import { runWide, subscribeWide, WideState } from './wide-performance';

const depth = 1000;
const deepIterations = 100;
const msPerDeepSubscription = 0.02;
const msPerDeepIteration = 3;
const msPerDeepUnsubscribe = 0.01;

const width = 10000;
const wideIterations = 100;
const msPerWideSubscription = 0.03;
const msPerWideIteration = 3;
const msPerWideUnsubscribe = 0.01;

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
