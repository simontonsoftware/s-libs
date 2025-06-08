import { effect, Injector } from '@angular/core';
import { Store } from '../lib/store';
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
  for (let i = depth; --i >= 0; store = store('next').nonNull) {
    const myStore = store;
    effect(
      () => {
        access(myStore.state);
        // console.log(myStore.state());
      },
      { injector },
    );
  }
  const elapsed = performance.now() - start;

  console.log('ms to subscribe deep:', elapsed);
  console.log(' - per subscription:', elapsed / depth);
  return elapsed;

  function access(_value: any): void {
    // we just need something to make accessing the state valid
  }
}

export async function runDeep(
  store: Store<DeepState>,
  iterations: number,
  tick: (() => Promise<unknown>) | (() => void),
): Promise<number> {
  const { leafStore } = analyze(store);

  const start = performance.now();
  for (let i = iterations; --i >= 0; ) {
    leafStore('counter').update(increment);
    await tick();
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
  for (; store('next').state; ++depth) {
    store = store('next').nonNull;
  }
  return { depth, leafStore: store };
}

function increment(n: number): number {
  return n + 1;
}
