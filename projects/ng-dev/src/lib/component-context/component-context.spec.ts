import { ComponentHarness } from '@angular/cdk/testing';
import {
  APP_INITIALIZER,
  Component,
  InjectionToken,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { sleep } from '@s-libs/js-core';
import { noop } from '@s-libs/micro-dash';
import { expectTypeOf } from 'expect-type';
import { staticTest } from '../static-test/static-test';
import { ComponentContext } from './component-context';

describe('ComponentContext', () => {
  @Component({ standalone: true, template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  @Component({ standalone: true, template: '' })
  class ChangeDetectingComponent implements OnChanges {
    @Input() myInput?: string;
    ngOnChangesSpy = jasmine.createSpy();

    ngOnChanges(changes: SimpleChanges): void {
      this.ngOnChangesSpy(changes);
    }
  }

  describe('.fixture', () => {
    it('is provided', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.run(() => {
        expect(ctx.fixture).toBeInstanceOf(ComponentFixture);
      });
    });
  });

  describe('constructor', () => {
    it('accepts module metadata to be bootstrapped', () => {
      const value = Symbol('');
      const token = new InjectionToken<symbol>('tok');
      const ctx = new ComponentContext(TestComponent, {
        providers: [{ provide: token, useValue: value }],
      });
      ctx.run(() => {
        expect(ctx.inject(token)).toBe(value);
      });
    });

    it('disables animations', () => {
      // do not use NoopAnimationsModule, because its timing is less finicky
      const ctx = new ComponentContext(TestComponent, {
        providers: [provideAnimations()],
      });
      ctx.run(() => {
        expect(ctx.inject(ANIMATION_MODULE_TYPE)).toBe('NoopAnimations');
      });
    });

    it('supports standalone components', () => {
      @Component({ template: 'hi', standalone: true })
      class StandaloneComponent {}

      const ctx = new ComponentContext(StandaloneComponent);
      ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('hi');
      });
    });

    it('supports non-standalone components', () => {
      // eslint-disable-next-line @angular-eslint/prefer-standalone-component
      @Component({ template: 'hi' })
      class ModulizedComponent {}

      const ctx = new ComponentContext(ModulizedComponent);
      ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('hi');
      });
    });

    it('errors with a nice message when given a non-component', () => {
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class NotAComponent {}

      expect(() => {
        // eslint-disable-next-line no-new -- nothing more is needed for this test
        new ComponentContext(NotAComponent);
      }).toThrowError('That does not appear to be a component');
    });
  });

  describe('.assignInputs()', () => {
    it('updates the inputs', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.run(() => {
        ctx.assignInputs({ name: 'New Guy' });
        expect(ctx.fixture.nativeElement.textContent).toContain('New Guy');
      });
    });

    it('triggers ngOnChanges() with the proper changes argument', () => {
      const ctx = new ComponentContext(ChangeDetectingComponent);
      ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        spy.calls.reset();
        ctx.assignInputs({ myInput: 'new value' });
        expect(spy).toHaveBeenCalledTimes(1);
        const changes: SimpleChanges = spy.calls.mostRecent().args[0];
        expect(changes['myInput'].currentValue).toBe('new value');
      });
    });

    it('errors with a nice message when given a non-input', () => {
      @Component({ standalone: true, template: '' })
      class NonInputComponent {
        // eslint-disable-next-line @angular-eslint/no-input-rename
        @Input('nonInput') letsTryToTrickIt?: string;
        nonInput?: string;
      }

      const ctx = new ComponentContext(NonInputComponent);
      expect(() => {
        ctx.assignInputs({ nonInput: 'value' });
      }).toThrowError(
        'Cannot bind to "nonInput" (it is not an input, or you passed it in `unboundProperties`)',
      );
      ctx.run(noop);
    });

    it('errors with a nice message when given an unbound input', () => {
      @Component({ standalone: true, template: '' })
      class UnboundInputComponent {
        @Input() doNotBind?: string;
      }
      const ctx = new ComponentContext(UnboundInputComponent, {}, [
        'doNotBind',
      ]);
      expect(() => {
        ctx.assignInputs({ doNotBind: "I'll do what I want" });
      }).toThrowError(
        'Cannot bind to "doNotBind" (it is not an input, or you passed it in `unboundProperties`)',
      );
      ctx.run(noop);
    });
  });

  describe('.assignWrapperStyles()', () => {
    it('can be used before .run()', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.assignWrapperStyles({ border: '1px solid black' });
      ctx.run(() => {
        const wrapper = ctx.fixture.debugElement.query(
          By.css('.s-libs-dynamic-wrapper'),
        );
        expect(wrapper.styles).toEqual(
          jasmine.objectContaining({ border: '1px solid black' }),
        );
      });
    });

    it('changes (only) the passed-in styles', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.assignWrapperStyles({ border: '1px solid black' });
      ctx.run(() => {
        ctx.assignWrapperStyles({ 'background-color': 'blue' });
        const wrapper = ctx.fixture.debugElement.query(
          By.css('.s-libs-dynamic-wrapper'),
        );
        expect(wrapper.styles).toEqual(
          jasmine.objectContaining({
            border: '1px solid black',
            'background-color': 'blue',
          }),
        );
      });
    });
  });

  describe('.getComponentInstance()', () => {
    it('returns the instantiated component', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.assignInputs({ name: 'instantiated name' });
      ctx.run(() => {
        expect(ctx.getComponentInstance().name).toBe('instantiated name');
      });
    });
  });

  describe('.init()', () => {
    it('creates a component of the type specified in the constructor', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.run(() => {
        expect(ctx.getComponentInstance()).toBeInstanceOf(TestComponent);
      });
    });

    it('triggers ngOnChanges', () => {
      const ctx = new ComponentContext(ChangeDetectingComponent);
      ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it('causes APP_INITIALIZERs to complete before instantiating the component', () => {
      const appInitSpy = jasmine.createSpy('app init');
      const componentInitSpy = jasmine.createSpy('component init');

      @Component({ standalone: true, template: '' })
      class InitializingComponent {
        constructor() {
          componentInitSpy();
        }
      }

      const ctx = new ComponentContext(InitializingComponent, {
        providers: [
          {
            provide: APP_INITIALIZER,
            useFactory: () => async (): Promise<void> => {
              await sleep(0);
              appInitSpy();
            },
            multi: true,
          },
        ],
      });
      ctx.run(async () => {
        expect(appInitSpy).toHaveBeenCalledBefore(componentInitSpy);
      });
    });
  });

  describe('.runChangeDetection()', () => {
    it('gets change detection working inside the fixture', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.run(() => {
        ctx.getComponentInstance().name = 'Changed Guy';
        ctx.tick();
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
  });

  describe('.cleanUp()', () => {
    it('destroys the fixture', () => {
      const ctx = new ComponentContext(TestComponent);
      ctx.run(noop);
      // This was the test in Angular 13, and still fails if the fixure is not destroyed in 14
      // ctx.getComponentInstance().name = 'Changed Guy';
      // ctx.fixture.detectChanges();
      // expect(ctx.fixture.nativeElement.textContent).not.toContain(
      //   'Changed Guy',
      // );
      expect(() => {
        ctx.getComponentInstance();
      }).toThrowError();
    });

    it('does the superclass things', () => {
      const ctx = new ComponentContext(TestComponent);
      expect(() => {
        ctx.run(() => {
          setInterval(noop, 10);
        });
      })
        // No error: "1 periodic timer(s) still in the queue."
        .not.toThrowError();
    });
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const ctx = new ComponentContext(TestComponent);
      expectTypeOf(ctx.fixture).toEqualTypeOf<ComponentFixture<unknown>>();
      expectTypeOf(ctx.assignInputs).toEqualTypeOf<
        (inputs: Partial<TestComponent>) => void
      >();
      expectTypeOf(ctx.getComponentInstance()).toEqualTypeOf<TestComponent>();
    });
  });
});

describe('ComponentContext class-level doc examples', () => {
  describe('simple example', () => {
    @Component({ standalone: true, template: 'Hello, {{name}}!' })
    class GreeterComponent {
      @Input() name!: string;
    }

    it('greets you by name', () => {
      const ctx = new ComponentContext(GreeterComponent);
      ctx.assignInputs({ name: 'World' });
      ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
      });
    });
  });

  describe('full example with routing', () => {
    /////////////////
    // app-context.ts

    // To re-use your context setup, make a subclass of ComponentContext to import into any spec
    class AppContext extends ComponentContext<AppComponent> {
      constructor() {
        super(AppComponent, {
          imports: [
            // This is your production `AppModule`. Make 1 tweak there: export `AppComponent`
            AppModule,
            // Import `routes` from your `app-routing.module.ts`
            RouterTestingModule.withRoutes(routes),
          ],
        });
      }
    }

    ////////////////////////
    // app.component.spec.ts

    describe('AppComponent', () => {
      let ctx: AppContext;
      beforeEach(() => {
        ctx = new AppContext();
      });

      it('can navigate to the first page', () => {
        ctx.run(async () => {
          const app = await ctx.getHarness(AppComponentHarness);
          await app.navigateToFirstPage();
          expect(ctx.fixture.nativeElement.textContent).toContain(
            'First works!',
          );
        });
      });
    });

    ///////////////////////////
    // app.component.harness.ts

    // A simple component harness to demonstrate its integration with component contexts
    class AppComponentHarness extends ComponentHarness {
      static hostSelector = 'app-root';

      private getFirstPageLink = this.locatorFor('a');

      async navigateToFirstPage(): Promise<void> {
        const link = await this.getFirstPageLink();
        await link.click();
      }
    }

    /////////////////////
    // first.component.ts

    // A minimal component for demonstration purposes
    @Component({ template: '<p>First works!</p>' })
    class FirstComponent {}

    ///////////////////
    // app.component.ts

    // A minimal app component with routing for demonstration purposes
    @Component({
      selector: 'app-root',
      template: `
        <a routerLink="/first-page">First Page</a>
        <router-outlet />
      `,
    })
    class AppComponent {}

    ////////////////////////
    // app-routing.module.ts

    // exported for use in tests
    const routes: Routes = [{ path: 'first-page', component: FirstComponent }];

    @NgModule({
      imports: [RouterModule.forRoot(routes)],
      exports: [RouterModule],
    })
    class AppRoutingModule {}

    ////////////////
    // app.module.ts

    // A minimal app module. Notice the added export.
    @NgModule({
      declarations: [AppComponent, FirstComponent],
      imports: [AppRoutingModule, BrowserAnimationsModule, BrowserModule],
      bootstrap: [AppComponent],
      exports: [AppComponent], // exported for use in tests
    })
    class AppModule {}
  });
});
