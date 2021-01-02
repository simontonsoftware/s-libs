import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { keys } from '@s-libs/micro-dash';
import { trimLeftoverStyles } from '../../trim-leftover-styles';
import { extendMetadata } from '../angular-context/angular-context';
import { AngularContextNext } from '../angular-context/angular-context-next';
import { createDynamicWrapper } from './create-dynamic-wrapper';

/**
 * A superclass to set up testing contexts for components. This is a foundation for an opinionated testing pattern, including everything described in {@link AngularContext} plus:
 *
 * - Automatically creates your component at the beginning of `run()`.
 * - Wraps your component in a dynamically created parent component. (This sets up Angular to call `ngOnChanges()` in your tests the same way it does in production.)
 * - Automatically disables animations.
 * - Automatically integrates {@link trimLeftoverStyles} to speed up your test suite.
 *
 * Why does the class name end with "Next"? This replaces the old `ComponentContext`, but it's a breaking change so this gives people some time to transition over. Eventually the old one will be removed and this will be renamed to `ComponentContext`.
 *
 * A very simple example:
 * ```ts
 * @Component({ template: 'Hello, {{name}}!' })
 * class GreeterComponent {
 *   @Input() name!: string;
 * }
 *
 * it('greets you by name', () => {
 *   const ctx = new ComponentContextNext(GreeterComponent);
 *   ctx.run({ inputs: { name: 'World' } }, () => {
 *     expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
 *   });
 * });
 * ```
 *
 * A full example, with routing and a component harness. This is the full code for a tiny Angular app:
 * ```ts
 * /////////////////
 * // app-context.ts
 *
 * // To re-use your context setup, make a subclass of ComponentContext to
 * // import into any spec
 * class AppContext extends ComponentContextNext<AppComponent> {
 *   constructor() {
 *     super(AppComponent, {
 *       imports: [
 *         // This is your production `AppModule`. Make sure it exports `AppComponent`
 *         AppModule,
 *         // Import `routes` from your `app-routing.module.ts`
 *         RouterTestingModule.withRoutes(routes),
 *       ],
 *     });
 *   }
 * }
 *
 * ////////////////////////
 * // app.component.spec.ts
 *
 * describe('AppComponent', () => {
 *   let ctx: AppContext;
 *   beforeEach(() => {
 *     ctx = new AppContext();
 *   });
 *
 *   it('can navigate to the first page', () => {
 *     ctx.run(() => {
 *       ctx.getHarness(AppComponentHarness).navigateToFirstPage();
 *       expect(ctx.fixture.nativeElement.textContent).toContain(
 *         'First works!',
 *       );
 *     });
 *   });
 * });
 *
 * ///////////////////////////
 * // app.component.harness.ts
 *
 * // A simple component harness to demonstrate its integration with component contexts. Note that everything here is asynchronous, but is treated as synchronous in tests. This is a trick in AngularContexts so harnesses can be used in the fakeAsync zone.
 * class AppComponentHarness extends ComponentHarness {
 *   static hostSelector = 'app-root';
 *
 *   private getFirstPageLink = this.locatorFor('a');
 *
 *   async navigateToFirstPage(): Promise<void> {
 *     const link = await this.getFirstPageLink();
 *     await link.click();
 *   }
 * }
 *
 * /////////////////////
 * // first.component.ts
 *
 * // A minimal component for demonstration purposes
 * @Component({ template: '<p>First works!</p>' })
 * class FirstComponent {}
 *
 * ///////////////////
 * // app.component.ts
 *
 * // A minimal app component with routing for demonstration purposes
 * @Component({
 *   selector: 'app-root',
 *   template: `
 *     <a routerLink="/first-page">First Page</a>
 *     <router-outlet></router-outlet>
 *   `,
 * })
 * class AppComponent {}
 *
 * ////////////////////////
 * // app-routing.module.ts
 *
 * // exported for use in tests
 * const routes: Routes = [{ path: 'first-page', component: FirstComponent }];
 *
 * @NgModule({
 *   imports: [RouterModule.forRoot(routes)],
 *   exports: [RouterModule],
 * })
 * class AppRoutingModule {}
 *
 * ////////////////
 * // app.module.ts
 *
 * // A minimal app module. Notice the added export.
 * @NgModule({
 *   declarations: [AppComponent, FirstComponent],
 *   imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule],
 *   bootstrap: [AppComponent],
 *   exports: [AppComponent], // exported for use in tests
 * })
 * class AppModule {}
 * ```
 */
export class ComponentContextNext<T> extends AngularContextNext {
  /**
   * The {@link ComponentFixture} for a synthetic wrapper around your component.
   */
  fixture!: ComponentFixture<unknown>;

  private componentType: Type<T>;
  private wrapperType: Type<T>;
  private inputProperties: Set<keyof T>;
  private inputs: Partial<T>;

  /**
   * @param componentType `run()` will create a component of this type before running the rest of your test.
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
   * @param unboundInputs By default a synthetic parent component will be created that binds to all your component's inputs. Pass input names here that should NOT be bound. This is useful e.g. to test the default value of an input.
   */
  constructor(
    componentType: Type<T>,
    moduleMetadata: TestModuleMetadata = {},
    unboundInputs: Array<keyof T> = [],
  ) {
    const wrapper = createDynamicWrapper(componentType, unboundInputs);
    super(
      extendMetadata(moduleMetadata, {
        imports: [NoopAnimationsModule],
        declarations: [wrapper.type, componentType],
      }),
    );
    this.componentType = componentType;
    this.wrapperType = wrapper.type;
    this.inputProperties = new Set(wrapper.inputProperties);
    this.inputs = {};
  }

  /**
   * Use within `run()` to update the inputs to your component and trigger all the appropriate change detection and lifecycle hooks. Only the inputs specified in `inputs` will be affected.
   */
  updateInputs(inputs: Partial<T>): void {
    for (const key of keys(inputs)) {
      if (!this.inputProperties.has(key as keyof T)) {
        throw new Error(
          `Cannot bind to "${key}" (it is not an input, or you passed it in \`unboundProperties\`)`,
        );
      }
    }

    Object.assign(this.inputs, inputs);
    if (this.isInitialized()) {
      Object.assign(this.fixture.componentInstance, inputs);
      this.tick();
    }
  }

  /**
   * Use within `run()` to get your instantiated component that is on the page.
   */
  getComponentInstance(): T {
    return this.fixture.debugElement.query(By.directive(this.componentType))
      .componentInstance;
  }

  /**
   * Constructs and initializes your component. Called during `run()` before it executes the rest of your test. Runs in the same `fakeAsync` zone as the rest of your test.
   */
  protected init(): void {
    trimLeftoverStyles();
    super.init();
    this.fixture = TestBed.createComponent(this.wrapperType);

    Object.assign(this.fixture.componentInstance, this.inputs);
    this.fixture.detectChanges();
    this.tick();
  }

  /** @hidden */
  protected runChangeDetection(): void {
    this.fixture.detectChanges();
  }

  /**
   * Performs any cleanup needed at the end of each test. This implementation destroys {@link fixture} and calls the super implementation.
   */
  protected cleanUp(): void {
    this.fixture.destroy();
    super.cleanUp();
  }

  private isInitialized(): boolean {
    return !!this.fixture;
  }
}
