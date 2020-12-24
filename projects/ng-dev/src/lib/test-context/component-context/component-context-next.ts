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
  ComponentType = unknown,
  InitOptions extends ComponentContextNextInit<ComponentType> = ComponentContextNextInit<ComponentType>
> extends AngularContext<InitOptions> {
  /**
   * The {@link ComponentFixture} for a synthetic wrapper around your component.
   */
  fixture!: ComponentFixture<unknown>;

  private componentType: Type<ComponentType>;
  private wrapperType: Type<ComponentType>;
  private inputProperties: Set<string>;

  /**
   * @param componentType `.run()` will create a component of this type before running the rest of your test.
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
   */
  constructor(
    componentType: Type<ComponentType>,
    moduleMetadata: TestModuleMetadata = {},
  ) {
    const { wrapperType, inputProperties } = createDynamicWrapper(
      componentType,
    );
    super(
      extendMetadata(moduleMetadata, {
        imports: [NoopAnimationsModule],
        declarations: [wrapperType, componentType],
      }),
    );
    this.componentType = componentType;
    this.wrapperType = wrapperType;
    this.inputProperties = new Set(inputProperties);
  }

  updateInputs(inputs: Partial<ComponentType>): void {
    for (const key of keys(inputs)) {
      if (!this.inputProperties.has(key as string)) {
        throw new Error(`"${key}" is not an input for this component`);
      }
    }
    Object.assign(this.fixture.componentInstance, inputs);
    this.tick();
  }

  getComponentInstance(): ComponentType {
    return this.fixture.debugElement.query(By.directive(this.componentType))
      .componentInstance;
  }

  /**
   * Constructs and initializes your component. Called during `.run()` before it executes the rest of your test. Runs in the same `fakeAsync` zone as the rest of your test.
   */
  protected init(options: Partial<InitOptions>): void {
    trimLeftoverStyles();
    super.init(options);
    this.fixture = TestBed.createComponent<ComponentType>(this.wrapperType);
    Object.assign(this.fixture.componentInstance, options.inputs);
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
