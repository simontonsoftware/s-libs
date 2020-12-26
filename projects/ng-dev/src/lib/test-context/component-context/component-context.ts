import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { trimLeftoverStyles } from '../../trim-leftover-styles';
import {
  AngularContext,
  extendMetadata,
} from '../angular-context/angular-context';

/** @hidden */
export interface ComponentContextInit<ComponentType> {
  input: Partial<ComponentType>;
}

/**
 * @deprecated Use {@link ComponentContextNext} instead. This old version will be removed in a future version, and `ComponentContextNext` renamed to `ComponentContext`.
 *
 * Some notes to migrate to the new version:
 * - Change "input" to "inputs" in calls to `.run({ input: {...}}, ...)`
 * - Any variables you set in "inputs" must now be actual angular `@Input()`s
 * - `ctx.fixture` is now for a synthetic wrapper component, not your component. Change `ctx.fixture.componentInstance` to `ctx.getComponentInstance()`
 * - If your component has an input with a default value that you want to preserve, pass it in the constructor's `unboundInputs` argument.
 */
export abstract class ComponentContext<
  ComponentType = unknown,
  Init extends ComponentContextInit<ComponentType> = ComponentContextInit<ComponentType>
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
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link NoopAnimationsModule}, in addition to those provided by {@link AngularContext}.
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
