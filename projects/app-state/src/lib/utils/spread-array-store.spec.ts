import { AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { Observable } from 'rxjs';
import { RootStore, Store } from '../index';
import { spreadArrayStore$ } from './spread-array-store';

describe('spreadArrayStore$()', () => {
  it('emits a separate store object for each element in the array', () => {
    const store = new RootStore([1, 2]);
    let emitted!: Array<Store<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      emitted = stores;
    });
    expect(emitted.length).toBe(2);
    expect(emitted[0].state()).toBe(1);
    expect(emitted[1].state()).toBe(2);

    store.set([3, 4, 5]);
    expect(emitted.length).toBe(3);
    expect(emitted[0].state()).toBe(3);
    expect(emitted[1].state()).toBe(4);
    expect(emitted[2].state()).toBe(5);

    store.set([6]);
    expect(emitted.length).toBe(1);
    expect(emitted[0].state()).toBe(6);

    store.set([]);
    expect(emitted.length).toBe(0);
  });

  it('only emits when the length of the array changes', () => {
    const store = new RootStore([1, 2]);
    const spy = jasmine.createSpy();
    spreadArrayStore$(store).subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    store.set([3, 4]);
    expect(spy).toHaveBeenCalledTimes(1);

    store.set([5, 6, 7]);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('emits the same object reference for indexes that remain', () => {
    const store = new RootStore([1, 2]);
    let lastEmit: Array<Store<number>>;
    let previousEmit: Array<Store<number>>;
    spreadArrayStore$(store).subscribe((stores) => {
      previousEmit = lastEmit;
      lastEmit = stores;
    });

    store.set([3, 4, 5]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
    expect(lastEmit![1]).toBe(previousEmit![1]);

    store.set([6]);
    expect(lastEmit![0]).toBe(previousEmit![0]);
  });

  it('treats null and undefined as empty arrays', () => {
    interface State {
      array?: number[] | null;
    }
    const arrayStore = new RootStore<State>({})('array');
    let emitted!: Array<Store<number>>;
    spreadArrayStore$(arrayStore).subscribe((stores) => {
      emitted = stores;
    });
    expect(emitted.length).toBe(0);

    arrayStore.set([1]);
    expect(emitted.length).toBe(1);

    arrayStore.set(null);
    expect(emitted.length).toBe(0);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const array = new RootStore([1]);
      const arrayOrNull = array as Store<number[] | null>;
      const arrayOrUndefined = array as Store<number[] | undefined>;
      const arrayOrNil = array as Store<number[] | null | undefined>;

      expectTypeOf(spreadArrayStore$(array)).toEqualTypeOf<
        Observable<Array<Store<number>>>
      >();
      expectTypeOf(spreadArrayStore$(arrayOrNull)).toEqualTypeOf<
        Observable<Array<Store<number>>>
      >();
      expectTypeOf(spreadArrayStore$(arrayOrUndefined)).toEqualTypeOf<
        Observable<Array<Store<number>>>
      >();
      expectTypeOf(spreadArrayStore$(arrayOrNil)).toEqualTypeOf<
        Observable<Array<Store<number>>>
      >();
    });
  });

  describe('documentation', () => {
    it('is working', async () => {
      interface Hero {
        name: string;
      }

      @Component({
        selector: 'app-hero',
        imports: [AsyncPipe],
        template: `{{ heroStore('name').$ | async }}`,
      })
      class HeroComponent {
        @Input() heroStore!: Store<Hero>;
      }

      // vvvv documentation below
      @Component({
        imports: [HeroComponent, AsyncPipe],
        template: `
          @for (heroStore of heroStores$ | async; track heroStore) {
            <app-hero [heroStore]="heroStore" />
          }
        `,
      })
      class HeroListComponent implements OnChanges {
        @Input() heroesStore!: Store<Hero[]>;
        protected heroStores$!: Observable<Array<Store<Hero>>>;

        ngOnChanges(): void {
          this.heroStores$ = spreadArrayStore$(this.heroesStore);
        }
      }
      // ^^^^ documentation above

      const ctx = new ComponentContext(HeroListComponent);
      ctx.assignInputs({ heroesStore: new RootStore([{ name: 'Alice' }]) });
      ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent.trim()).toBe('Alice');
      });
    });
  });
});
