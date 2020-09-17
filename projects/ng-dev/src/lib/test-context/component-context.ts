import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { trimLeftoverStyles } from '../trim-leftover-styles';
import { AngularContext, extendMetadata } from './angular-context';

/** @hidden */
export interface ComponentContextInit<ComponentType> {
  input: Partial<ComponentType>;
}

/**
 * A superclass to set up testing contexts for components. This is a foundation for an opinionated testing pattern, including everything described in {@link AngularContext}. A very simple example:
 *
 * ```ts
 * @Component({ template: 'Hello, {{name}}!' })
 * class GreeterComponent {
 *   @Input() name!: string;
 * }
 *
 * class GreeterComponentContext extends ComponentContext {
 *   protected componentType = GreeterComponent;
 * }
 *
 * describe('ComponentContext', () => {
 *   let ctx: GreeterComponentContext;
 *   beforeEach(() => {
 *     ctx = new GreeterComponentContext();
 *   });
 *
 *   it('greets you by name', () => {
 *     ctx.run({ input: { name: 'World' } }, () => {
 *       expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
 *     });
 *   });
 * })
 * ```
 *
 * This class integrates {@link trimLeftoverStyles} to speed up your test suite, as described in the docs for that function.
 */
export abstract class ComponentContext<
  ComponentType = unknown,
  Init extends ComponentContextInit<ComponentType> = ComponentContextInit<
    ComponentType
  >
> extends AngularContext<Init> {
  /**
   * The {@link ComponentFixture} for your component, provided by Angular's testing framework.
   */
  fixture!: ComponentFixture<ComponentType>;

  /**
   * `.run()` will create a component of this type before running the rest of your test.
   */
  protected abstract componentType: Type<ComponentType>;

  /**
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule} and {@link HttpClientTestingModule} for you.
   */
  constructor(moduleMetadata: TestModuleMetadata = {}) {
    super(extendMetadata(moduleMetadata, { imports: [NoopAnimationsModule] }));
  }

  /**
   * Constructs and initializes your component. Called during `.run()` before it executes the rest of your test. Runs in the same `fakeAsync` zone as the rest of your test.
   */
  protected init(options: Partial<Init>): void {
    trimLeftoverStyles();
    super.init(options);
    this.fixture = TestBed.createComponent(this.componentType);
    Object.assign(this.fixture.componentInstance, options.input);
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
}
