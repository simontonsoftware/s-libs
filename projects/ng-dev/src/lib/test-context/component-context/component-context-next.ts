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
import { AngularContext, extendMetadata } from '../angular-context';
import { createDynamicWrapper } from './create-dynamic-wrapper';

/** @hidden */
export interface ComponentContextNextInit<ComponentType> {
  inputs: Partial<ComponentType>;
}

/**
 * A superclass to set up testing contexts for components. This is a foundation for an opinionated testing pattern, including everything described in {@link AngularContext}. A very simple example:
 *
 * TODO: update
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
export class ComponentContextNext<
  ComponentUnderTest,
  InitOptions extends ComponentContextNextInit<ComponentUnderTest> = ComponentContextNextInit<ComponentUnderTest>
> extends AngularContext<InitOptions> {
  /**
   * The {@link ComponentFixture} for a synthetic wrapper around your component.
   */
  fixture!: ComponentFixture<unknown>;

  private componentType: Type<ComponentUnderTest>;
  private wrapperType: Type<ComponentUnderTest>;
  private inputProperties: Set<keyof ComponentUnderTest>;

  /**
   * @param componentType `.run()` will create a component of this type before running the rest of your test.
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
   */
  constructor(
    componentType: Type<ComponentUnderTest>,
    moduleMetadata: TestModuleMetadata = {},
    unboundInputs: Array<keyof ComponentUnderTest> = [],
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
  }

  updateInputs(inputs: Partial<ComponentUnderTest>): void {
    this.validateInputs(inputs);
    Object.assign(this.fixture.componentInstance, inputs);
    this.tick();
  }

  getComponentInstance(): ComponentUnderTest {
    return this.fixture.debugElement.query(By.directive(this.componentType))
      .componentInstance;
  }

  /**
   * Constructs and initializes your component. Called during `.run()` before it executes the rest of your test. Runs in the same `fakeAsync` zone as the rest of your test.
   */
  protected init(options: Partial<InitOptions>): void {
    trimLeftoverStyles();
    super.init({});
    this.fixture = TestBed.createComponent<ComponentUnderTest>(
      this.wrapperType,
    );

    const inputs = options.inputs || {};
    this.validateInputs(inputs);
    Object.assign(this.fixture.componentInstance, inputs);

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

  private validateInputs(inputs: Partial<ComponentUnderTest>): void {
    for (const key of keys(inputs)) {
      if (!this.inputProperties.has(key as keyof ComponentUnderTest)) {
        throw new Error(
          `Cannot bind to "${key}" (it is not an input, or you passed it in \`unboundProperties\`)`,
        );
      }
    }
  }
}
