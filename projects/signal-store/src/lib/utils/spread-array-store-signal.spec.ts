import { Component, effect, input, Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { RootStore } from '../root-store';
import { ReadonlyStore, Store } from '../store';
import { spreadArrayStoreSignal } from './spread-array-store-signal';

/* eslint-disable @typescript-eslint/no-deprecated -- the purpose of this file is to test a deprecated function */

describe('spreadArrayStoreSignal()', () => {
  it('emits a separate store object for each element in the array', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(new RootStore([1, 2]));
      const subStores = spreadArrayStoreSignal(source);
      let emitted!: Array<Store<number>>;
      effect(() => {
        emitted = subStores();
      });

      // initial value
      TestBed.tick();
      expect(emitted.length).toBe(2);
      expect(emitted[0].state).toBe(1);
      expect(emitted[1].state).toBe(2);

      // increase length
      source.set(new RootStore([3, 4, 5]));
      TestBed.tick();
      expect(emitted.length).toBe(3);
      expect(emitted[0].state).toBe(3);
      expect(emitted[1].state).toBe(4);
      expect(emitted[2].state).toBe(5);

      // decrease length
      source().state = [6];
      TestBed.tick();
      expect(emitted.length).toBe(1);
      expect(emitted[0].state).toBe(6);

      // empty
      source.set(new RootStore<number[]>([]));
      TestBed.tick();
      expect(emitted.length).toBe(0);
    });
  });

  it('only emits when the length of the array changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(new RootStore([1, 2]));
      const subStores = spreadArrayStoreSignal(source);
      let emissions = 0;
      effect(() => {
        emissions++;
        subStores();
      });
      TestBed.tick();
      expect(emissions).toBe(1);

      source().state = [3, 4];
      TestBed.tick();
      expect(emissions).toBe(1);

      source().state = [7, 8, 9];
      TestBed.tick();
      expect(emissions).toBe(2);
    });
  });

  it('emits with a new source store of the same length', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(new RootStore([1, 2]));
      const subStores = spreadArrayStoreSignal(source);
      let emissions = 0;
      effect(() => {
        emissions++;
        subStores();
      });
      TestBed.tick();
      expect(emissions).toBe(1);

      source.set(new RootStore([1, 2]));
      TestBed.tick();
      expect(emissions).toBe(2);
    });
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('emits the same object reference for indexes that remain', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(new RootStore([1, 2]));
      const subStores = spreadArrayStoreSignal(source);
      let lastEmit: Array<Store<number>>;
      let previousEmit: Array<Store<number>>;
      effect(() => {
        previousEmit = lastEmit;
        lastEmit = subStores();
      });
      TestBed.tick();

      source().state = [3, 4, 5];
      TestBed.tick();
      expect(lastEmit![0]).toBe(previousEmit![0]);
      expect(lastEmit![1]).toBe(previousEmit![1]);

      source().state = [6];
      TestBed.tick();
      expect(lastEmit![0]).toBe(previousEmit![0]);
    });
  });

  it('treats null and undefined as empty arrays', () => {
    TestBed.runInInjectionContext(() => {
      interface State {
        array?: number[] | null;
      }

      const source = signal(new RootStore<State>({})('array'));
      const subStores = spreadArrayStoreSignal(source);
      let emitted!: Array<ReadonlyStore<number | undefined>>;
      effect(() => {
        emitted = subStores();
      });
      TestBed.tick();
      expect(emitted.length).toBe(0);

      source().state = [1];
      TestBed.tick();
      expect(emitted.length).toBe(1);

      source().state = null;
      TestBed.tick();
      expect(emitted.length).toBe(0);
    });
  });

  describe('documentation', () => {
    it('is working', async () => {
      interface Hero {
        name: string;
      }

      @Component({
        selector: 'app-hero',
        standalone: true,
        template: `{{ heroStore()('name').state }}`,
      })
      class HeroComponent {
        readonly heroStore = input.required<Store<Hero>>();
      }

      // vvvv documentation below
      @Component({
        imports: [HeroComponent],
        standalone: true,
        template: `
          @for (heroStore of heroStores(); track heroStore) {
            <app-hero [heroStore]="heroStore" />
          }
        `,
      })
      class HeroListComponent {
        readonly heroesStore = input.required<Store<Hero[]>>();
        protected heroStores = spreadArrayStoreSignal(this.heroesStore);
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
        const array = null as unknown as Signal<Store<number[]>>;
        const arrayOrNull = array as Signal<Store<number[] | null>>;
        const arrayOrUndefined = array as Signal<Store<number[] | undefined>>;
        const arrayOrNil = array as Signal<Store<number[] | null | undefined>>;

        expectTypeOf(spreadArrayStoreSignal(array)).toEqualTypeOf<
          Signal<Array<Store<number>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrNull)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrUndefined)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrNil)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
      });
    });

    it('is fancy for readonly stores', () => {
      staticTest(() => {
        const array = null as unknown as Signal<ReadonlyStore<number[]>>;
        const arrayOrNull = array as Signal<ReadonlyStore<number[] | null>>;
        const arrayOrUndefined = array as Signal<
          ReadonlyStore<number[] | undefined>
        >;
        const arrayOrNil = array as Signal<
          ReadonlyStore<number[] | null | undefined>
        >;

        expectTypeOf(spreadArrayStoreSignal(array)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrNull)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrUndefined)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
        expectTypeOf(spreadArrayStoreSignal(arrayOrNil)).toEqualTypeOf<
          Signal<Array<ReadonlyStore<number | undefined>>>
        >();
      });
    });
  });
});
