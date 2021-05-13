import { Component, Injectable, Type } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RootStore } from '@s-libs/app-state';
import { keys, noop } from "@s-libs/micro-dash";
import * as ngAppState from '@s-libs/ng-app-state';
import { NasModelModule } from '@s-libs/ng-app-state';

describe('ng-app-state', () => {
  describe('public API', () => {
    it('has NasModelModule', () => {
      expect(NasModelModule).toBeDefined();
    });
  });

  describe('as a UMD bundle', () => {
    const bundle: typeof ngAppState = (window as any).sLibs.ngAppState;

    it('is available at sLibs.ngAppState', () => {
      expect(keys(bundle)).toEqual(
        jasmine.arrayWithExactContents(keys(ngAppState)),
      );
    });

    it('knows where to find @angular/core, @angular/forms, and app-state', fakeAsync(() => {
      // NasModel uses the above module(s). This is one of its tests

      let fixture: ComponentFixture<any>;

      function detectChanges(): void {
        fixture.detectChanges();
      }

      @Injectable()
      class SingleValueStore extends RootStore<any> {
        constructor() {
          super('old');
        }
      }

      class StoreComponent<T extends object> {
        compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
          o1 && o2 ? o1.id === o2.id : o1 === o2;

        constructor(public store: RootStore<T>) {}
      }

      @Component({})
      class SingleValueComponent extends StoreComponent<any> {
        constructor(store: SingleValueStore) {
          super(store);
        }
      }

      function query(css: string): any {
        return queryAll(css)[0];
      }

      function queryAll(css: string): any[] {
        return fixture.debugElement
          .queryAll(By.css(css))
          .map((el) => el.nativeElement);
      }

      function initSingleValueTest(template: string): SingleValueStore {
        return initTest(SingleValueComponent, SingleValueStore, { template });
      }

      function initTest<C, S>(
        component: Type<C>,
        storeType: Type<S>,
        {
          extraDirectives = [] as Array<Type<any>>,
          template = '',
          beforeCreate = noop,
        } = {},
      ): S {
        if (template) {
          TestBed.overrideComponent(component, { set: { template } });
        }
        TestBed.configureTestingModule({
          declarations: [component, ...extraDirectives],
          imports: [FormsModule, NasModelModule],
          providers: [storeType],
        });

        beforeCreate();
        fixture = TestBed.createComponent<C>(component);
        return TestBed.inject(storeType);
      }

      const testStore = initSingleValueTest(`
        <input
          type="number"
          [nasModel]="store('num')"
          [disabled]="store('disabled').$ | async"
        />
      `);
      testStore.set({ num: 2, disabled: true });
      const input = query('input');

      detectChanges();
      flushMicrotasks();
      expect(input.disabled).toBe(true);

      testStore.assign({ disabled: false });
      detectChanges();
      flushMicrotasks();
      expect(input.disabled).toBe(false);
    }));
  });
});
