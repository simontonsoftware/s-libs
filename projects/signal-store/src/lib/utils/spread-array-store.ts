import { computed, Signal } from '@angular/core';
import { ReadonlySlice, ReadonlyStore, Slice, Store } from '../store';
import { spreadArrayStore as impl } from './spread-array-store-signal';

/**
 * Just like {@link spreadArrayStoreSignal}, but accepts a `Store` or `ReadonlyStore` directly instead of a `Signal<Store>` or `Signal<ReadonlyStore>`. This is useful for legacy components that still use `@Input()` decorators instead of signal inputs.
 *
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
): Signal<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return computed(() => impl(source));
}
