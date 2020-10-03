import { Observable } from 'rxjs';
import { distinctUntilKeyChanged, map } from 'rxjs/operators';
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
  source: Store<Array<T>>,
): Observable<Array<Store<T>>> {
  let cache: Array<Store<T>> = [];
  return source.$.pipe(
    distinctUntilKeyChanged('length'),
    map((array) => {
      if (array.length < cache.length) {
        cache = cache.slice(0, array.length);
      } else {
        cache = cache.slice();
        for (let i = cache.length; i < array.length; ++i) {
          cache[i] = source(i);
        }
      }
      return cache;
    }),
  );
}
