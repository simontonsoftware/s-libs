import { keys } from 'micro-dash';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isSetEqual } from 's-js-utils';
import { mapAndCacheObjectElements } from 's-rxjs-utils';
import { Store } from '../index';

/**
 * Returns an observable that emits an array of store objects, one for each element in `source`'s state. The resulting arrays will have references to the exact store objects included in the previous emission when possible, making them performant to use in `*ngFor` expressions without the need to use `trackBy`.
 *
 * ```ts
 * interface HeroMap {
 *   [name: string]: Hero;
 * }
 *
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
 *   @Input() private heroesStore: Store<HeroMap>;
 *
 *   ngOnChanges() {
 *     this.heroStores$ = spreadObjectStore(this.heroesStore);
 *   }
 * }
 * ```
 */
export function spreadObjectStore$<T extends object>(
  source: Store<T>,
): Observable<Array<Store<T[keyof T]>>> {
  let lastKeySet: Set<string | keyof T> | undefined;
  return source.$.pipe(
    filter((value) => {
      const keySet = new Set(keys(value));
      if (lastKeySet && isSetEqual(keySet, lastKeySet)) {
        return false;
      }

      lastKeySet = keySet;
      return true;
    }),
    mapAndCacheObjectElements(
      (_value, key) => key,
      (_value, key) => source(key as keyof T),
    ),
  );
}
