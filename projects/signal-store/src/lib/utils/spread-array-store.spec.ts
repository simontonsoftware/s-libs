import { Component, Input, OnChanges, Signal } from '@angular/core';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { RootStore } from '../root-store';
import { ReadonlyStore, Store } from '../store';
import { spreadArrayStore } from './spread-array-store';

/* eslint-disable @angular-eslint/prefer-signals -- this is a legacy function designed for components that still use @Input() decorators */

describe('spreadArrayStore()', () => {
  // just the test for documentation is good enough. We only need a sanity check because all the details are tested in `spreadArrayStoreSignal.spec.ts`

  describe('documentation', () => {
    it('is working', async () => {
      interface Hero {
        name: string;
      }

      @Component({
        standalone: true,
        selector: 'app-hero',
        template: `{{ heroStore('name').state }}`,
      })
      class HeroComponent {
        @Input() heroStore!: Store<Hero>;
      }

      // vvvv documentation below
      @Component({
        standalone: true,
        template: `
          @for (heroStore of heroStores(); track heroStore) {
            <app-hero [heroStore]="heroStore" />
          }
        `,
        imports: [HeroComponent],
      })
      class HeroListComponent implements OnChanges {
        @Input() heroesStore!: Store<Hero[]>;
        protected heroStores!: Signal<Array<Store<Hero>>>;

        ngOnChanges(): void {
          this.heroStores = spreadArrayStore(this.heroesStore);
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

  describe('typing', () => {
    it('is fancy for writable stores', () => {
      staticTest(() => {
        const array = null as unknown as Store<number[]>;
        const arrayOrNull = array as Store<number[] | null>;
        const arrayOrUndefined = array as Store<number[] | undefined>;
        const arrayOrNil = array as Store<number[] | null | undefined>;

        expectTypeOf(spreadArrayStore(array)).toEqualTypeOf<
          Signal<Array<Store<number>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrNull)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrUndefined)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrNil)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
      });
    });

    it('is fancy for readonly stores', () => {
      staticTest(() => {
        const array = null as unknown as ReadonlyStore<number[]>;
        const arrayOrNull = array as ReadonlyStore<number[] | null>;
        const arrayOrUndefined = array as ReadonlyStore<number[] | undefined>;
        const arrayOrNil = array as ReadonlyStore<number[] | null | undefined>;

        expectTypeOf(spreadArrayStore(array)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrNull)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrUndefined)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStore(arrayOrNil)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
      });
    });
  });
});
