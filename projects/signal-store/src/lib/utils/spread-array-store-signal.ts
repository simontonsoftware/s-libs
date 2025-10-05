import { computed, Signal } from '@angular/core';
import { ReadonlySlice, ReadonlyStore, Slice, Store } from '../store';
import { spreadArrayStoreNew } from './spread-array-store';

/**
 * @deprecated This function will be removed in a future release. Use {@link spreadArrayStoreNew} directly.
 */

export function spreadArrayStoreSignal<T extends any[] | null | undefined>(
  source: Signal<Store<T>>,
): Signal<Array<Slice<T, number>>>;
export function spreadArrayStoreSignal<T extends any[] | null | undefined>(
  source: Signal<ReadonlyStore<T>>,
): Signal<Array<ReadonlySlice<T, number>>>;

export function spreadArrayStoreSignal(source: Signal<any>): Signal<any> {
  return computed((): any[] => spreadArrayStoreNew(source()));
}
