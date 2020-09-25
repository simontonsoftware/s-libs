import { Type } from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { convertTime } from 's-js-utils';
import { trimLeftoverStyles } from 's-ng-dev-utils';
import { AngularContext, extendMetadata } from './angular-context';

export interface ComponentContextInitOptions<ComponentType> {
  input?: Partial<ComponentType>;
}

export abstract class ComponentContext<
  ComponentType = unknown,
  InitOptions extends ComponentContextInitOptions<
    ComponentType
  > = ComponentContextInitOptions<ComponentType>
> extends AngularContext<InitOptions> {
  fixture!: ComponentFixture<ComponentType>;
  protected abstract componentType: Type<ComponentType>;

  constructor(moduleMetadata: TestModuleMetadata) {
    super(
      extendMetadata(moduleMetadata, {
        imports: [NoopAnimationsModule],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
      }),
    );
  }

  tick(amount = 0, unit = 'ms'): void {
    flushMicrotasks();
    this.fixture.detectChanges();
    tick(convertTime(amount, unit, 'ms'));
  }

  protected init(options: Partial<InitOptions>): void {
    trimLeftoverStyles();
    super.init(options);
    this.fixture = TestBed.createComponent(this.componentType);
    Object.assign(this.fixture.componentInstance, options.input);
    this.fixture.detectChanges();
    this.tick();
  }

  protected cleanUp(): void {
    this.fixture.destroy();
    super.cleanUp();
  }
}
