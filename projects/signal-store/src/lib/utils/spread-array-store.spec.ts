import { Component, effect, Input, OnChanges, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { RootStore } from '../root-store';
import { ReadonlyStore, Store } from '../store';
import { spreadArrayStore } from './spread-array-store';

describe('spreadArrayStore()', () => {
  it('emits a separate store object for each element in the array', () => {
    TestBed.runInInjectionContext(() => {
      const store = new RootStore([1, 2]);
      const subStores = spreadArrayStore(store);
      let emitted!: Array<Store<number>>;

      effect(() => {
        emitted = subStores();
      });
      TestBed.flushEffects();
      expect(emitted.length).toBe(2);
      expect(emitted[0].state).toBe(1);
      expect(emitted[1].state).toBe(2);

      store.state = [3, 4, 5];
      TestBed.flushEffects();
      expect(emitted.length).toBe(3);
      expect(emitted[0].state).toBe(3);
      expect(emitted[1].state).toBe(4);
      expect(emitted[2].state).toBe(5);

      store.state = [6];
      TestBed.flushEffects();
      expect(emitted.length).toBe(1);
      expect(emitted[0].state).toBe(6);

      store.state = [];
      TestBed.flushEffects();
      expect(emitted.length).toBe(0);
    });
  });

  it('only emits when the length of the array changes', () => {
    TestBed.runInInjectionContext(() => {
      const store = new RootStore([1, 2]);
      const subStores = spreadArrayStore(store);
      let emissions = 0;
      effect(() => {
        emissions++;
        subStores();
      });
      TestBed.flushEffects();
      expect(emissions).toBe(1);

      store.state = [3, 4];
      TestBed.flushEffects();
      expect(emissions).toBe(1);

      store.state = [5, 6, 7];
      TestBed.flushEffects();
      expect(emissions).toBe(2);
    });
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('emits the same object reference for indexes that remain', () => {
    TestBed.runInInjectionContext(() => {
      const store = new RootStore([1, 2]);
      const subStores = spreadArrayStore(store);
      let lastEmit: Array<Store<number>>;
      let previousEmit: Array<Store<number>>;
      effect(() => {
        previousEmit = lastEmit;
        lastEmit = subStores();
      });
      TestBed.flushEffects();

      store.state = [3, 4, 5];
      TestBed.flushEffects();
      expect(lastEmit![0]).toBe(previousEmit![0]);
      expect(lastEmit![1]).toBe(previousEmit![1]);

      store.state = [6];
      TestBed.flushEffects();
      expect(lastEmit![0]).toBe(previousEmit![0]);
    });
  });

  it('treats null and undefined as empty arrays', () => {
    TestBed.runInInjectionContext(() => {
      interface State {
        array?: number[] | null;
      }

      const store = new RootStore<State>({})('array');
      const subStores = spreadArrayStore(store);
      let emitted!: Array<ReadonlyStore<number | undefined>>;
      effect(() => {
        emitted = subStores();
      });
      TestBed.flushEffects();
      expect(emitted.length).toBe(0);

      store.state = [1];
      TestBed.flushEffects();
      expect(emitted.length).toBe(1);

      store.state = null;
      TestBed.flushEffects();
      expect(emitted.length).toBe(0);
    });
  });

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
