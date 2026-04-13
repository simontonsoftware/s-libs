import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RootStore } from '../lib/root-store';
import { DeepState, runDeep, subscribeDeep } from './deep-performance';
import { unsubscribe } from './performance-utils';
import { runWide, subscribeWide, WideState } from './wide-performance';

// To reset the baseline for these numbers, run them in the integration app & multiply by 10

const depth = 1000;
const deepIterations = 100;
const msPerDeepSubscription = 0.01;
const msPerDeepIteration = 2;
const msPerDeepUnsubscribe = 0.001;

const width = 1000;
const wideIterations = 100;
const msPerWideSubscription = 0.04;
const msPerWideIteration = 0.5;
const msPerWideUnsubscribe = 0.004;

describe('performance', () => {
  it('is good with a deep state', async () => {
    const store = new RootStore(DeepState.build(depth));
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector),
    );

    const timeToSubscribe = subscribeDeep(store, injector);
    const timeToChange = await runDeep(store, deepIterations, TestBed.tick);
    const timeToUnsubscribe = unsubscribe(depth, injector);

    expect(timeToSubscribe / depth).toBeLessThan(msPerDeepSubscription);
    expect(timeToChange / deepIterations).toBeLessThan(msPerDeepIteration);
    expect(timeToUnsubscribe / depth).toBeLessThan(msPerDeepUnsubscribe);
  });

  it('is good with a wide state', async () => {
    const store = new RootStore(new WideState(width));
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector),
    );

    const timeToSubscribe = subscribeWide(store, injector);
    const timeToChange = await runWide(store, wideIterations, TestBed.tick);
    const timeToUnsubscribe = unsubscribe(width, injector);

    expect(timeToSubscribe / width).toBeLessThan(msPerWideSubscription);
    expect(timeToChange / wideIterations).toBeLessThan(msPerWideIteration);
    expect(timeToUnsubscribe / width).toBeLessThan(msPerWideUnsubscribe);
  });
});
