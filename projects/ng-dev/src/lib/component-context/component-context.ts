import {
  ApplicationInitStatus,
  ApplicationRef,
  reflectComponentType,
  Type,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { assert } from '@s-libs/js-core';
import { keys } from '@s-libs/micro-dash';
import {
  AngularContext,
  extendMetadata,
} from '../angular-context/angular-context';
import { Inputs, WrapperComponent } from './wrapper.component';

/**
 * Provides the foundation for an opinionated pattern for component tests.
 *
 * - Includes all features from {@link AngularContext}
 * - Automatically creates your component at the beginning of `run()`.
 * - Sets up Angular to call `ngOnChanges()` like it would in production. This is not the case if you use the standard `TestBed.createComponent()` directly.
 * - Wraps your component in a parent that you can easily style however you like.
 * - Lets you use {@link https://material.angular.dev/cdk/testing/overview | component harnesses} in the `fakeAsync` zone, which is normally a challenge.
 * - Automatically disables animations.
 * - Causes async {@link https://angular.dev/api/core/APP_INITIALIZER | APP_INITIALIZER}s to complete before instantiating the component. Two caveats:
 *   - this requires all work in your initializers to complete with a call to `tick()`
 *   - this requires delaying app initialization until inside the `fakeAsync` zone, i.e. with the callback to {@link #run}. If you have async initializers, you must be careful not to do things that finalize the app setup before then, such as {@link #inject}.
 *
 * A very simple example:
 * ```ts
 * @Component({ template: 'Hello, {{name()}}!' })
 * class GreeterComponent {
 *   readonly name = input.required<string>();
 * }
 *
 * it('greets you by name', () => {
 *   const ctx = new ComponentContext(GreeterComponent);
 *   ctx.assignInputs({ name: 'World' });
 *   ctx.run(() => {
 *  expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
 *   });
 * });
 * ```
 *
 * A full example, with routing and a component harness. This is the full code for a tiny Angular app:
 * ```ts
 *  /////////////////
 *  // app-context.ts
 *
 *  // To re-use your context setup, make a subclass of ComponentContext to import into any spec
 *  class AppContext extends ComponentContext<AppComponent> {
 *    constructor() {
 *      // Import `appConfig` from `app.config.ts`
 *      super(AppComponent, appConfig);
 *    }
 *  }
 *
 *  ////////////////////////
 *  // app.component.spec.ts
 *
 *  describe('AppComponent', () => {
 *    let ctx: AppContext;
 *    beforeEach(() => {
 *      ctx = new AppContext();
 *    });
 *
 *    it('can navigate to the first page', () => {
 *      ctx.run(async () => {
 *        const app = await ctx.getHarness(AppComponentHarness);
 *        await app.navigateToFirstPage();
 *        expect(ctx.fixture.nativeElement.textContent).toContain(
 *          'First works!',
 *        );
 *      });
 *    });
 *  });
 *
 *  ///////////////////////////
 *  // app.component.harness.ts
 *
 *  // A simple component harness to demonstrate its integration with component contexts
 *  class AppComponentHarness extends ComponentHarness {
 *    static hostSelector = 'app-root';
 *
 *    #getFirstPageLink = this.locatorFor('a');
 *
 *    async navigateToFirstPage(): Promise<void> {
 *      const link = await this.#getFirstPageLink();
 *      await link.click();
 *    }
 *  }
 *
 *  /////////////////////
 *  // first.component.ts
 *
 *  // A minimal component for demonstration purposes
 *  @Component({ template: '<p>First works!</p>' })
 *  class FirstComponent {}
 *
 *  ///////////////////
 *  // app.component.ts
 *
 *  // A minimal app component with routing for demonstration purposes
 *  @Component({
 *    selector: 'app-root',
 *    imports: [RouterOutlet, RouterLink],
 *    template: `
 *      <a routerLink="/first-page">First Page</a>
 *      <router-outlet />
 *    `,
 *  })
 *  class AppComponent {}
 *
 *  ////////////////////////
 *  // app.routes.ts
 *
 *  const routes: Routes = [{ path: 'first-page', component: FirstComponent }];
 *
 *  ////////////////
 *  // app.config.ts
 *
 *  const appConfig: ApplicationConfig = { providers: [provideRouter(routes)] };
 * ```
 */
export class ComponentContext<T> extends AngularContext {
  /**
   * The {@link ComponentFixture} for a synthetic wrapper around your component. Available with the callback to `run()`.
   */
  fixture!: ComponentFixture<unknown>;

  #componentType: Type<T>;
  #inputProperties: Set<keyof T>;

  #inputs: Inputs<T>;
  #wrapperStyles: Record<string, any>;

  /**
   * @param componentType `run()` will create a component of this type before running the rest of your test.
   * @param moduleMetadata passed along to {@linkcode https://angular.dev/api/core/testing/TestBedStatic#configureTestingModule | TestBed.configureTestingModule()}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
   * @param unboundInputs By default a synthetic parent component will be created that binds to all your component's inputs. Pass input names here that should NOT be bound. This is useful e.g. to test the default value of an input.
   */
  constructor(
    componentType: Type<T>,
    moduleMetadata: TestModuleMetadata = {},
    unboundInputs: Array<keyof T> = [],
  ) {
    const mirror = reflectComponentType(componentType);
    assert(mirror, 'That does not appear to be a component');
    const inputProperties = WrapperComponent.wrap(mirror, unboundInputs);
    const imports: any[] = [];
    const declarations: any[] = [WrapperComponent];
    (mirror.isStandalone ? imports : declarations).push(componentType);
    super(
      extendMetadata({ imports, declarations }, moduleMetadata, {
        providers: [provideNoopAnimations()],
      }),
    );

    this.#componentType = componentType;
    this.#inputProperties = new Set(inputProperties);
    this.#inputs = {};
    this.#wrapperStyles = {};
  }

  /**
   * Assign css styles to the div wrapping your component. Can be called before or during `run()`. Accepts an object with the same structure as the {@link https://angular.dev/api/common/NgStyle | ngStyle directive}.
   *
   * ```ts
   * ctx.assignWrapperStyles({
   *   width: '400px',
   *   height: '600px',
   *   margin: '20px auto',
   *   border: '1px solid',
   * });
   * ```
   */
  assignWrapperStyles(styles: Record<string, any>): void {
    Object.assign(this.#wrapperStyles, styles);

    if (this.#isInitialized()) {
      this.#flushStylesToWrapper();
      this.tick();
    }
  }

  /**
   * Assign inputs passed into your component. Can be called before `run()` to set the initial inputs, or within `run()` to update them and trigger all the appropriate change detection and lifecycle hooks.
   */
  assignInputs(inputs: Inputs<T>): void {
    for (const key of keys(inputs)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      if (!this.#inputProperties.has(key as keyof T)) {
        throw new Error(
          `Cannot bind to "${String(
            key,
          )}" (it is not an input, or you passed it in \`unboundProperties\`)`,
        );
      }
    }

    Object.assign(this.#inputs, inputs);
    if (this.#isInitialized()) {
      this.#flushInputsToWrapper();
      this.tick();
    }
  }

  /**
   * Use within `run()` to get your instantiated component that is on the page.
   */
  getComponentInstance(): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.fixture.debugElement.query(By.directive(this.#componentType))
      .componentInstance;
  }

  /**
   * Constructs and initializes your component. Called during `run()` before it executes the rest of your test. Runs in the same `fakeAsync` zone as the rest of your test.
   */
  protected override init(): void {
    super.init();

    // Inject something (I think anything) to finalize the compiler and trigger any registered APP_INITIALIZER. Then `tick()` to (hopefully) run it, assuming the user is only doing things that will be flushed right away.
    this.inject(ApplicationInitStatus);
    tick(); // can't use `this.tick()` until the component exists

    this.fixture = TestBed.createComponent(WrapperComponent);
    this.inject(ApplicationRef).attachView(this.fixture.componentRef.hostView);

    this.#flushStylesToWrapper();
    this.#flushInputsToWrapper();
    this.fixture.detectChanges();
    this.tick();
  }

  /**
   * Performs any cleanup needed at the end of each test. This implementation destroys {@link fixture} and calls the super implementation.
   */
  protected override cleanUp(): void {
    this.fixture.destroy();
    super.cleanUp();
  }

  #isInitialized(): boolean {
    return !!this.fixture;
  }

  #flushInputsToWrapper(): void {
    Object.assign(this.#getWrapperComponentInstance().inputs, this.#inputs);
  }

  #flushStylesToWrapper(): void {
    Object.assign(
      this.#getWrapperComponentInstance().styles,
      this.#wrapperStyles,
    );
  }

  #getWrapperComponentInstance(): WrapperComponent<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return this.fixture.componentInstance as WrapperComponent<T>;
  }
}
