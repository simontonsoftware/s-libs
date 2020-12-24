import { Component, Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { assert } from '@s-libs/js-core';
import { flatten, keys, map } from '@s-libs/micro-dash';
import { trimLeftoverStyles } from '../trim-leftover-styles';
import { AngularContext, extendMetadata } from './angular-context';

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
  private wrapperComponentType: Type<ComponentType>;

  /**
   * @param componentType `.run()` will create a component of this type before running the rest of your test.
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
   */
  constructor(
    componentType: Type<ComponentType>,
    moduleMetadata: TestModuleMetadata = {},
  ) {
    const dynamicWrapper = createDynamicWrapper(componentType);
    super(
      extendMetadata(moduleMetadata, {
        imports: [NoopAnimationsModule],
        declarations: [dynamicWrapper, componentType],
      }),
    );
    this.componentType = componentType;
    this.wrapperComponentType = dynamicWrapper;
  }

  updateInputs(inputs: Partial<ComponentType>): void {
    const properties = new Set(
      getInputs(this.componentType).map(({ binding }) => binding),
    );
    for (const key of keys(inputs)) {
      if (!properties.has(key as string)) {
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
    this.fixture = TestBed.createComponent<ComponentType>(
      this.wrapperComponentType,
    );
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

function createDynamicWrapper<T>(componentType: Type<T>): Type<T> {
  const selector = getSelector(componentType);
  const inputs = getInputs(componentType);

  const template = `
    <div>
      <${selector}
        ${inputs
          .map(({ binding, property }) => `[${binding}]="${property}"`)
          .join(' ')}
      ></${selector}>
    </div>
  `;

  @Component({ template })
  class DynamicWrapperComponent {}

  return DynamicWrapperComponent as Type<T>;
}

function getSelector(componentType: Type<unknown>): string {
  const annotations = Reflect.getOwnPropertyDescriptor(
    componentType,
    '__annotations__',
  );
  assert(annotations, 'That does not appear to be a component');

  let selector = annotations.value.find((decorator: any) => decorator.selector)
    ?.selector;
  if (!isValidSelector(selector)) {
    selector = 's-libs-component-under-test';
    TestBed.overrideComponent(componentType, { set: { selector } });
  }
  return selector;
}

function isValidSelector(selector: string): boolean {
  if (!selector) {
    return false;
  }
  try {
    document.createElement(selector);
    return true;
  } catch {
    return false;
  }
}

function getInputs(
  componentType: any,
): Array<{ binding: string; property: string }> {
  return flatten(
    map(componentType.propDecorators, (decorators: any[], property: string) => {
      const inputDecorators = decorators.filter(
        (decorator) => decorator.type.prototype.ngMetadataName === 'Input',
      );
      return inputDecorators.map((decorator) => {
        const binding = decorator.args?.[0] || property;
        return { property, binding };
      });
    }),
  );
}
