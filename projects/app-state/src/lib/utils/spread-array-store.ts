import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Store } from '../index';

/**
 * Returns an observable that emits an array of store objects, one for each element in `source`'s state. The resulting arrays will have references to the exact store objects included in the previous emission when possible, making them performant to use in `*ngFor` expressions without the need to use `trackBy`.
 *
 * ```ts
 * @Component({
 *   template: `
 *     <hero
 *       *ngFor="let heroStore of heroStores$ | async"
 *       [heroStore]="heroStore"
 *     ></hero>
 *   `,
 * })
 * class HeroListComponent {
 *   heroStores$: Observable<Array<Store<Hero>>>;
 *   @Input() private heroesStore: Store<Array<Hero>>;
 *
 *   ngOnChanges() {
 *     this.heroStores$ = spreadArrayStore(this.heroesStore);
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
