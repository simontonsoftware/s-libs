import { ComponentHarness } from '@angular/cdk/testing';
import {
  ApplicationConfig,
  Component,
  Directive,
  effect,
  InjectionToken,
  input,
  Input,
  model,
  OnChanges,
  provideAppInitializer,
  provideZonelessChangeDetection,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  provideRouter,
  RouterLink,
  RouterOutlet,
  Routes,
} from '@angular/router';
import { Deferred } from '@s-libs/js-core';
import { noop } from '@s-libs/micro-dash';
import { expectTypeOf } from 'expect-type';
import { staticTest } from '../static-test/static-test';
import { ComponentContext } from './component-context';

describe('ComponentContext', () => {
  @Component({ template: 'Hello, {{name()}}!' })
  class TestComponent {
    readonly name = model<string>('Default');
  }

  @Component({ template: '' })
  class ChangeDetectingComponent implements OnChanges {
    readonly myInput = input<string>();
    readonly ngOnChangesSpy = vi.fn();

    ngOnChanges(changes: SimpleChanges): void {
      this.ngOnChangesSpy(changes);
    }
  }

  describe('.fixture', () => {
    it('is provided', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.run(() => {
        expect(ctx.fixture).toBeInstanceOf(ComponentFixture);
      });
    });
  });

  describe('constructor', () => {
    it('accepts module metadata to be bootstrapped', async () => {
      const value = Symbol('');
      const token = new InjectionToken<symbol>('tok');
      const ctx = new ComponentContext(TestComponent, {
        providers: [{ provide: token, useValue: value }],
      });
      await ctx.run(() => {
        expect(ctx.inject(token)).toBe(value);
      });
    });

    it('supports standalone components', async () => {
      @Component({ standalone: true, template: 'hi' })
      class StandaloneComponent {}

      const ctx = new ComponentContext(StandaloneComponent);
      await ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('hi');
      });
    });

    it('supports non-standalone components', async () => {
      // eslint-disable-next-line @angular-eslint/prefer-standalone
      @Component({ standalone: false, template: 'hi' })
      class ModulizedComponent {}

      const ctx = new ComponentContext(ModulizedComponent);
      await ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('hi');
      });
    });

    it('errors with a nice message when given a non-component', async () => {
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class NotAComponent {}

      expect(() => {
        // eslint-disable-next-line no-new -- nothing more is needed for this test
        new ComponentContext(NotAComponent);
      }).toThrow('That does not appear to be a component');
    });
  });

  describe('.assignInputs()', () => {
    // it('updates the inputs with zone', async () => {
    //   const ctx = new ComponentContext(TestComponent, {
    //     providers: [provideZoneChangeDetection()],
    //   });
    //   await ctx.run(async () => {
    //     await ctx.assignInputs({ name: 'New Guy' });
    //     expect(ctx.fixture.nativeElement.textContent).toContain('New Guy');
    //   });
    // });

    it('updates the inputs without zone', async () => {
      const ctx = new ComponentContext(TestComponent, {
        providers: [provideZonelessChangeDetection()],
      });
      await ctx.run(async () => {
        await ctx.assignInputs({ name: 'New Guy' });
        expect(ctx.fixture.nativeElement.textContent).toContain('New Guy');
      });
    });

    it('triggers ngOnChanges() with the proper changes argument', async () => {
      const ctx = new ComponentContext(ChangeDetectingComponent);
      await ctx.run(async () => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        spy.mockClear();
        await ctx.assignInputs({ myInput: 'new value' });
        expect(spy).toHaveBeenCalledTimes(1);
        const changes: SimpleChanges = vi.mocked(spy).mock.lastCall![0];
        expect(changes['myInput'].currentValue).toBe('new value');
      });
    });

    it('errors with a nice message when given a non-input', async () => {
      @Component({ template: '' })
      class NonInputComponent {
        // eslint-disable-next-line @angular-eslint/no-input-rename
        readonly letsTryToTrickIt = input('', { alias: 'nonInput' });
        nonInput?: string;
      }

      const ctx = new ComponentContext(NonInputComponent);
      await expect(ctx.assignInputs({ nonInput: 'value' })).rejects.toThrow(
        'Cannot bind to "nonInput"; it is not an input',
      );
      await ctx.run(noop);
    });

    it('supports signal and non-signal inputs', async () => {
      @Component({ template: '{{optional()}} {{required()}} {{legacy}}' })
      class SignalComponent {
        // eslint-disable-next-line @angular-eslint/prefer-signals -- this is the point of the test
        @Input() legacy!: string;
        readonly optional = input<string>();
        readonly required = input.required<string>();
      }
      const ctx = new ComponentContext(SignalComponent);
      await ctx.assignInputs({
        optional: 'optional',
        required: 'required',
        legacy: 'legacy',
      });
      await ctx.run(async () => {
        expect(ctx.fixture.nativeElement.textContent).toBe(
          'optional required legacy',
        );
      });
    });

    it('can handle renamed inputs', async () => {
      @Component({ template: '{{ propName() }}' })
      class RenamedInputComponent {
        // eslint-disable-next-line @angular-eslint/no-input-rename
        readonly propName = input('', { alias: 'templateName' });
      }

      const ctx = new ComponentContext(RenamedInputComponent);
      await ctx.assignInputs({ propName: 'custom value' });
      await ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toContain('custom value');
      });
    });

    it('can handle inputs that are setters', async () => {
      @Component({ template: '' })
      class SetterInputComponent {
        receivedValue?: string;

        // eslint-disable-next-line @angular-eslint/prefer-signals -- this test is about supporting a legacy behavior
        @Input()
        set setterInput(value: string) {
          this.receivedValue = value;
        }
      }

      const ctx = new ComponentContext(SetterInputComponent);
      await ctx.assignInputs({ setterInput: 'sent value' });
      await ctx.run(() => {
        expect(ctx.getComponentInstance().receivedValue).toBe('sent value');
      });
    });

    it("can handle components that don't have inputs", async () => {
      @Component({ template: '' })
      class NoInputComponent {}

      await expect(
        new ComponentContext(NoInputComponent).run(noop),
      ).resolves.not.toThrow();
    });

    // https://github.com/simontonsoftware/s-libs/issues/40
    it('can handle inputs defined by a superclass (production bug)', async () => {
      @Directive()
      class SuperclassComponent {
        readonly superclassInput = input('');
      }

      @Component({ template: '' })
      class SubclassComponent extends SuperclassComponent {
        readonly subclassInput = input('');
      }

      const ctx = new ComponentContext(SubclassComponent);
      await ctx.assignInputs({ superclassInput: 'an actual value' });
      await ctx.run(() => {
        expect(ctx.getComponentInstance().superclassInput()).toBe(
          'an actual value',
        );
      });
    });

    it('allows using default values for inputs', async () => {
      @Component({ template: '' })
      class UnboundInputComponent {
        readonly doNotBind = input('default value');
      }
      const ctx = new ComponentContext(UnboundInputComponent, {});
      await ctx.run(() => {
        expect(ctx.getComponentInstance().doNotBind()).toBe('default value');
      });
    });
  });

  describe('.assignWrapperStyles()', () => {
    it('can be used before .run()', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.assignWrapperStyles({ border: '1px solid black' });
      await ctx.run(() => {
        const wrapper = ctx.fixture.debugElement.query(
          By.css('.s-libs-dynamic-wrapper'),
        );
        expect(wrapper.styles).toEqual(
          expect.objectContaining({ border: '1px solid black' }),
        );
      });
    });

    it('changes (only) the passed-in styles', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.assignWrapperStyles({ border: '1px solid black' });
      await ctx.run(async () => {
        await ctx.assignWrapperStyles({ 'background-color': 'blue' });
        const wrapper = ctx.fixture.debugElement.query(
          By.css('.s-libs-dynamic-wrapper'),
        );
        expect(wrapper.styles).toEqual(
          expect.objectContaining({
            border: '1px solid black',
            'background-color': 'blue',
          }),
        );
      });
    });
  });

  describe('.getComponentInstance()', () => {
    it('returns the instantiated component', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.assignInputs({ name: 'instantiated name' });
      await ctx.run(() => {
        expect(ctx.getComponentInstance().name()).toBe('instantiated name');
      });
    });
  });

  describe('.init()', async () => {
    it('creates a component of the type specified in the constructor', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.run(() => {
        expect(ctx.getComponentInstance()).toBeInstanceOf(TestComponent);
      });
    });

    it('triggers ngOnChanges if there are inputs', async () => {
      const ctx = new ComponentContext(ChangeDetectingComponent);
      await ctx.assignInputs({ myInput: 'blah' });
      await ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it('does not triggers ngOnChanges if there are no inputs', async () => {
      const ctx = new ComponentContext(ChangeDetectingComponent);
      await ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });

    it('waits for app init (via superclass)', async () => {
      const deferred = new Deferred<void>();
      let componentCreated = false;

      @Component({ template: '' })
      class InitializingComponent {
        constructor() {
          componentCreated = true;
        }
      }
      const ctx = new ComponentContext(InitializingComponent, {
        providers: [provideAppInitializer(async () => deferred.promise)],
      });
      const testPromise = ctx.run(noop);

      await vi.advanceTimersByTimeAsync(0);
      expect(componentCreated).toBe(false);
      deferred.resolve();
      await testPromise;
      expect(componentCreated).toBe(true);
    });

    it('does not trigger "ApplicationRef.tick is called recursively" (prod bug)', async () => {
      const trigger = signal(false);

      @Component({ template: '' })
      class LocalComponent {
        constructor() {
          effect(() => {
            trigger();
          });
        }
      }

      const ctx = new ComponentContext(LocalComponent);
      await expect(
        ctx.run(() => {
          trigger.set(true);
        }),
      ).resolves.not.toThrow();
    });

    it("uses the component's selector if it is a tag name", async () => {
      @Component({ selector: 'sl-tag-name', template: '' })
      class TagNameComponent {}

      const ctx = new ComponentContext(TagNameComponent);
      await ctx.run(() => {
        const debugEl = ctx.fixture.debugElement.query(
          By.directive(TagNameComponent),
        );
        expect(debugEl.nativeElement.tagName).toBe('SL-TAG-NAME');
      });
    });

    it("can handle components that don't have a selector", async () => {
      @Component({ template: 'the template' })
      class NoSelectorComponent {}

      const ctx = new ComponentContext(NoSelectorComponent);
      await ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toContain('the template');
      });
    });
  });

  describe('.runChangeDetection()', () => {
    // it('gets change detection working inside the fixture with zone', async () => {
    //   const ctx = new ComponentContext(TestComponent, {
    //     providers: [provideZoneChangeDetection()],
    //   });
    //   await ctx.run(async () => {
    //     ctx.getComponentInstance().name.set('Changed Guy');
    //     expect(ctx.fixture.nativeElement.textContent).not.toContain(
    //       'Changed Guy',
    //     );
    //     await ctx.tick();
    //     expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
    //   });
    // });

    it('gets change detection working inside the fixture without zone', async () => {
      const ctx = new ComponentContext(TestComponent, {
        providers: [provideZonelessChangeDetection()],
      });
      await ctx.run(async () => {
        ctx.getComponentInstance().name.set('Changed Guy');
        expect(ctx.fixture.nativeElement.textContent).not.toContain(
          'Changed Guy',
        );
        await ctx.tick();
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
  });

  describe('.cleanUp()', () => {
    it('destroys the fixture', async () => {
      const ctx = new ComponentContext(TestComponent);
      await ctx.run(noop);
      // This was the test in Angular 13, and still fails if the fixture is not destroyed in 14
      // ctx.getComponentInstance().name = 'Changed Guy';
      // ctx.fixture.detectChanges();
      // expect(ctx.fixture.nativeElement.textContent).not.toContain(
      //   'Changed Guy',
      // );
      expect(() => {
        ctx.getComponentInstance();
      }).toThrow();
    });
  });

  it('has fancy typing', () => {
    staticTest(async () => {
      const ctx = new ComponentContext(TestComponent);
      expectTypeOf(ctx.fixture).toEqualTypeOf<ComponentFixture<unknown>>();
      await ctx.assignInputs({});
      await ctx.assignInputs({ name: 'blah' });
      // @ts-expect-error -- name must be a string
      await ctx.assignInputs({ name: 2 });
      expectTypeOf(ctx.getComponentInstance()).toEqualTypeOf<TestComponent>();
    });
  });
});

describe('ComponentContext class-level doc examples', () => {
  describe('simple example', () => {
    @Component({ template: 'Hello, {{name()}}!' })
    class GreeterComponent {
      readonly name = input.required<string>();
    }

    it('greets you by name', async () => {
      const ctx = new ComponentContext(GreeterComponent);
      await ctx.assignInputs({ name: 'World' });
      await ctx.run(() => {
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
        // Import `appConfig` from `app.config.ts`
        super(AppComponent, appConfig);
      }
    }

    ////////////////////////
    // app.component.spec.ts

    describe('AppComponent', () => {
      let ctx: AppContext;
      beforeEach(() => {
        ctx = new AppContext();
      });

      it('can navigate to the first page', async () => {
        await ctx.run(async () => {
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

      #getFirstPageLink = this.locatorFor('a');

      async navigateToFirstPage(): Promise<void> {
        const link = await this.#getFirstPageLink();
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
      imports: [RouterOutlet, RouterLink],
      template: `
        <a routerLink="/first-page">First Page</a>
        <router-outlet />
      `,
    })
    class AppComponent {}

    ////////////////////////
    // app.routes.ts

    const routes: Routes = [{ path: 'first-page', component: FirstComponent }];

    ////////////////
    // app.config.ts

    const appConfig: ApplicationConfig = { providers: [provideRouter(routes)] };
  });
});
