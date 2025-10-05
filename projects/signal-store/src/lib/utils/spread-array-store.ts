import { computed, Signal } from '@angular/core';
import { times } from '@s-libs/micro-dash';
import { ReadonlySlice, ReadonlyStore, Slice, Store } from '../store';

/**
 * @deprecated This function will be removed in a future major version, and {@linkcode spreadArrayStoreNew} will be renamed to take its place.
 */

export function spreadArrayStore<T extends any[] | null | undefined>(
  source: Store<T>,
): Signal<Array<Slice<T, number>>>;
export function spreadArrayStore<T extends any[] | null | undefined>(
  source: ReadonlyStore<T>,
): Signal<Array<ReadonlySlice<T, number>>>;

export function spreadArrayStore(source: Store<any> | ReadonlyStore<any>): any {
  return computed(() => spreadArrayStoreNew(source));
}

/**
 * Return an array of store objects, one for each element in `source`'s state. The emitted arrays will have references to the exact store objects included in the previous emission when possible, making them performant for direct comparison in change detection.
 *
 * ```ts
 * @Component({
 *   imports: [HeroComponent],
 *   standalone: true,
 *   template: `
 *     @for (heroStore of heroStores(); track heroStore) {
 *       <app-hero [heroStore]="heroStore" />
 *     }
 *   `,
 * })
 * class HeroListComponent {
 *   readonly heroesStore = input.required<Store<Hero[]>>();
 *   protected readonly heroStores = computed(() =>
 *     spreadArrayStoreNew(this.heroesStore()),
 *   );
 * }
 * ```
 */

export function spreadArrayStoreNew<T extends any[] | null | undefined>(
  source: Store<T>,
): Array<Slice<T, number>>;
export function spreadArrayStoreNew<T extends any[] | null | undefined>(
  source: ReadonlyStore<T>,
): Array<ReadonlySlice<T, number>>;

export function spreadArrayStoreNew<T extends any[] | null | undefined>(
  source: ReadonlyStore<T> | Store<T>,
): any[] {
  return times(source('length').state ?? 0, (i) => source(i));
}
