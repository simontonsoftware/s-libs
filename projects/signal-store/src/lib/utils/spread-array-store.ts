import { computed, Signal } from '@angular/core';
import { times } from '@s-libs/micro-dash';
import { ReadonlySlice, ReadonlyStore, Slice, Store } from '../store';

/**
 * Return a signal that emits an array of store objects, one for each element in `source`'s state. The emitted arrays will have references to the exact store objects included in the previous emission when possible, making them performant for direct comparison in change detection.
 *
 * ```ts
 * @Component({
 *   standalone: true,
 *   template: `
 *     @for (heroStore of heroStores(); track heroStore) {
 *       <app-hero [heroStore]="heroStore" />
 *     }
 *   `,
 *   imports: [HeroComponent],
 * })
 * class HeroListComponent implements OnChanges {
 *   @Input() heroesStore!: Store<Hero[]>;
 *   protected heroStores!: Signal<Array<Store<Hero>>>;
 *
 *   ngOnChanges(): void {
 *     this.heroStores = spreadArrayStore(this.heroesStore);
 *   }
 * }
 * ```
 */

export function spreadArrayStore<T extends any[] | null | undefined>(
  source: Store<T>,
): Signal<Array<Slice<T, number>>>;
export function spreadArrayStore<T extends any[] | null | undefined>(
  source: ReadonlyStore<T>,
): Signal<Array<ReadonlySlice<T, number>>>;

export function spreadArrayStore<T extends any[] | null | undefined>(
  source: ReadonlyStore<T> | Store<T>,
): Signal<any> {
  return computed(() => times(source('length').state ?? 0, (i) => source(i)));
}
