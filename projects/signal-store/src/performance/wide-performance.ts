import { effect, Injector } from '@angular/core';
import { times } from '@s-libs/micro-dash';
import { Store } from '../lib';
import { CounterState } from './counter-state';

export class WideState {
  array: CounterState[];

  constructor(width: number) {
    this.array = times(width, () => new CounterState());
  }
}

export function subscribeWide(
  store: Store<WideState>,
  injector: Injector,
): number {
  const arrayStore = store('array');
  const width = arrayStore.state.length;

  const start = performance.now();
  for (let i = width; --i >= 0; ) {
    const myStore = arrayStore(i)('counter');
    effect(
      () => {
        access(myStore.state);
        // console.log(myStore.state());
      },
      { injector },
    );
  }
  const elapsed = performance.now() - start;

  console.log('ms to subscribe wide:', elapsed);
  console.log(' - per subscription:', elapsed / width);
  return elapsed;

  function access(_value: any): void {
    // we just need something to make access the state valid
  }
}

export async function runWide(
  store: Store<WideState>,
  iterations: number,
  flushEffects: (() => Promise<unknown>) | (() => void),
): Promise<number> {
  const counterStore = store('array')(0)('counter');

  const start = performance.now();
  for (let i = iterations; --i; ) {
    counterStore.update(increment);
    await flushEffects();
  }
  const elapsed = performance.now() - start;

  console.log('ms to run wide:', elapsed);
  console.log(' - per iteration:', elapsed / iterations);
  return elapsed;
}

function increment(n: number): number {
  return n + 1;
}
