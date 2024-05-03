import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Store } from '../index';

/**
 * Returns an observable that emits an array of store objects, one for each element in `source`'s state. The emitted arrays will have references to the exact store objects included in the previous emission when possible, making them performant to use in `*ngFor` expressions without the need to use `trackBy`.
 *
 * ```ts
 * @Component({
 *   standalone: true,
 *   template: `
 *     @for (heroStore of heroStores$ | async; track heroStore) {
 *       <app-hero [heroStore]="heroStore" />
 *     }
 *   `,
 *   imports: [HeroComponent, AsyncPipe],
 * })
 * class HeroListComponent implements OnChanges {
 *   @Input() heroesStore!: Store<Hero[]>;
 *   protected heroStores$!: Observable<Array<Store<Hero>>>;
 *
 *   ngOnChanges(): void {
 *     this.heroStores$ = spreadArrayStore$(this.heroesStore);
 *   }
 * }
 * ```
 */
export function spreadArrayStore$<T>(
  source: Store<T[] | null | undefined>,
): Observable<Array<Store<T>>> {
  let cache: Array<Store<T>> = [];
  return source.$.pipe(
    distinctUntilChanged((x, y) => (x?.length ?? 0) === (y?.length ?? 0)),
    map((array) => {
      array ??= [];
      if (array.length < cache.length) {
        cache = cache.slice(0, array.length);
      } else {
        cache = cache.slice();
        for (let i = cache.length; i < array.length; ++i) {
          cache[i] = (source as Store<T[]>)(i);
        }
      }
      return cache;
    }),
  );
}
