import { Store } from '../store';
import { computed, Signal } from '@angular/core';
import { times } from '@s-libs/micro-dash';

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
export function spreadArrayStore<T>(
  source: Store<T[] | null | undefined>,
): Signal<Array<Store<T>>> {
  return computed(() =>
    times((source as any)('length').state ?? 0, (i) =>
      (source as Store<T[]>)(i),
    ),
  );
}
