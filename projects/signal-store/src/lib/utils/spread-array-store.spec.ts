import { Component, computed, effect, input, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { DetachedStore } from '../detached-store';
import { RootStore } from '../root-store';
import { ReadonlyStore, Store } from '../store';
import { spreadArrayStore, spreadArrayStoreNew } from './spread-array-store';

/* eslint-disable @typescript-eslint/no-deprecated -- this spec exists to test a deprecated function */

describe('spreadArrayStore()', () => {
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

describe('spreadArrayStoreNew()', () => {
  it('returns a separate store object for each element in the array', () => {
    // initial value
    let result = spreadArrayStoreNew(new DetachedStore([1, 2]));
    expect(result.length).toBe(2);
    expect(result[0].state).toBe(1);
    expect(result[1].state).toBe(2);

    // increase length
    result = spreadArrayStoreNew(new DetachedStore([3, 4, 5]));
    expect(result.length).toBe(3);
    expect(result[0].state).toBe(3);
    expect(result[1].state).toBe(4);
    expect(result[2].state).toBe(5);

    // decrease length
    result = spreadArrayStoreNew(new DetachedStore([6]));
    expect(result.length).toBe(1);
    expect(result[0].state).toBe(6);

    // empty
    result = spreadArrayStoreNew(new DetachedStore<number[]>([]));
    expect(result.length).toBe(0);
  });

  it('when computed, only emits when the length of the array changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = new RootStore([1, 2]);
      const subStores = computed(() => spreadArrayStoreNew(source));
      let emissions = 0;
      effect(() => {
        emissions++;
        subStores();
      });
      TestBed.tick();
      expect(emissions).toBe(1);

      source.state = [3, 4];
      TestBed.tick();
      expect(emissions).toBe(1);

      source.state = [7, 8, 9];
      TestBed.tick();
      expect(emissions).toBe(2);
    });
  });

  // this makes it nice for use in templates that use OnPush change detection
  it('returns the same object reference when called in succession', () => {
    const source = new DetachedStore([1, 2]);

    let before = spreadArrayStoreNew(source);
    source.state = [3, 4, 5];
    let after = spreadArrayStoreNew(source);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);

    before = after;
    source.state = [6];
    after = spreadArrayStoreNew(source);
    expect(after[0]).toBe(before[0]);
  });

  it('treats null and undefined as empty arrays', () => {
    TestBed.runInInjectionContext(() => {
      interface State {
        array?: number[] | null;
      }

      const source = new DetachedStore<State>({})('array');
      expect(spreadArrayStoreNew(source).length).toBe(0);

      source.state = [1];
      expect(spreadArrayStoreNew(source).length).toBe(1);

      source.state = null;
      expect(spreadArrayStoreNew(source).length).toBe(0);
    });
  });

  describe('documentation', () => {
    it('works', async () => {
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
        protected readonly heroStores = computed(() =>
          spreadArrayStoreNew(this.heroesStore()),
        );
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

        expectTypeOf(spreadArrayStoreNew(array)).toEqualTypeOf<
          Array<Store<number>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrNull)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrUndefined)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrNil)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
      });
    });

    it('is fancy for readonly stores', () => {
      staticTest(() => {
        const array = null as unknown as ReadonlyStore<number[]>;
        const arrayOrNull = array as ReadonlyStore<number[] | null>;
        const arrayOrUndefined = array as ReadonlyStore<number[] | undefined>;
        const arrayOrNil = array as ReadonlyStore<number[] | null | undefined>;

        expectTypeOf(spreadArrayStoreNew(array)).toEqualTypeOf<
          Array<ReadonlyStore<number>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrNull)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrUndefined)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
        expectTypeOf(spreadArrayStoreNew(arrayOrNil)).toEqualTypeOf<
          Array<ReadonlyStore<number | undefined>>
        >();
      });
    });
  });
});
