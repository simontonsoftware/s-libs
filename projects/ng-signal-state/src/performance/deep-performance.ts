import { effect, Injector } from '@angular/core';
import { Store } from '../lib';
import { CounterState } from './counter-state';

export class DeepState extends CounterState {
  next?: DeepState;

  constructor(depth: number) {
    super();
    if (depth > 1) {
      this.next = new DeepState(depth - 1);
    }
  }
}

export function subscribeDeep(
  store: Store<DeepState>,
  injector: Injector,
): number {
  const { depth } = analyze(store);

  const start = performance.now();
  for (let i = depth; --i >= 0; store = store('next')) {
    const myStore = store;
    effect(
      () => {
        myStore.state();
        // console.log(myStore.state());
      },
      { injector },
    );
  }
  const elapsed = performance.now() - start;

  console.log('ms to subscribe deep:', elapsed);
  console.log(' - per subscription:', elapsed / depth);
  return elapsed;
}

export async function runDeep(
  store: Store<DeepState>,
  iterations: number,
  flushEffects: (() => Promise<unknown>) | (() => void),
): Promise<number> {
  const { leafStore } = analyze(store);

  const start = performance.now();
  for (let i = iterations; --i >= 0; ) {
    leafStore('counter').setUsing(increment);
    await flushEffects();
  }
  const elapsed = performance.now() - start;

  console.log('ms to run deep:', elapsed);
  console.log(' - per iteration:', elapsed / iterations);
  return elapsed;
}

function analyze(store: Store<DeepState>): {
  depth: number;
  leafStore: Store<DeepState>;
} {
  let depth = 1;
  for (; store('next').state(); ++depth) {
    store = store('next');
  }
  return { depth, leafStore: store };
}

function increment(n: number): number {
  return n + 1;
}
