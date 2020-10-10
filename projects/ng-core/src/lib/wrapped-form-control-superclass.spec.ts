import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  flushMicrotasks,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ComponentContext } from 'ng-dev';
import { click, find, findButton, setValue } from '../test-helpers';
import { DirectiveSuperclass } from './directive-superclass';
import {
  FormControlSuperclass,
  provideValueAccessor,
} from './form-control-superclass';
import { InjectableSuperclass } from './injectable-superclass';
import { WrappedFormControlSuperclass } from './wrapped-form-control-superclass';

@Component({
  template: `
    <s-string-component
      [(ngModel)]="string"
      (ngModelChange)="emissions = emissions + 1"
      #stringControl="ngModel"
      [disabled]="shouldDisable"
    ></s-string-component>
    <div *ngIf="stringControl.touched">Touched!</div>
    <button (click)="shouldDisable = !shouldDisable">Toggle Disabled</button>
    <hr />
    <s-date-component [(ngModel)]="date"></s-date-component>
  `,
})
class TestComponent {
  emissions = 0;
  string = '';
  date = new Date();
  shouldDisable = false;
}

@Component({
  selector: `s-string-component`,
  template: ` <input [formControl]="formControl" /> `,
  providers: [provideValueAccessor(StringComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StringComponent extends WrappedFormControlSuperclass<string> {
  constructor(injector: Injector) {
    super(injector);
  }
}

@Component({
  selector: `s-date-component`,
  template: ` <input type="datetime-local" [formControl]="formControl" /> `,
  providers: [provideValueAccessor(DateComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DateComponent extends WrappedFormControlSuperclass<Date, string> {
  constructor(injector: Injector) {
    super(injector);
  }

  protected innerToOuter(value: string): Date {
    return new Date(value + 'Z');
  }

  protected outerToInner(value: Date): string {
    if (value === null) {
      return ''; // happens during initialization
    }
    return value.toISOString().substr(0, 16);
  }
}

class TestComponentContext extends ComponentContext<TestComponent> {
  protected componentType = TestComponent;

  constructor() {
    super({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [DateComponent, StringComponent, TestComponent],
      // this can go away with component harnesses eventually
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
    });
  }
}

describe('WrappedFormControlSuperclass', () => {
  let ctx: TestComponentContext;
  beforeEach(() => {
    ctx = new TestComponentContext();
  });

  function stringInput(): HTMLInputElement {
    return find<HTMLInputElement>(ctx.fixture, 's-string-component input');
  }

  function dateInput(): HTMLInputElement {
    return find<HTMLInputElement>(ctx.fixture, 's-date-component input');
  }

  function toggleDisabledButton(): HTMLButtonElement {
    return findButton(ctx.fixture, 'Toggle Disabled');
  }

  ///////

  it('provides help for 2-way binding', () => {
    ctx.run({ input: { string: 'initial value' } }, () => {
      expect(stringInput().value).toBe('initial value');

      setValue(stringInput(), 'edited value');
      expect(ctx.fixture.componentInstance.string).toBe('edited value');
    });
  });

  it('can translate between inner and outer values', () => {
    ctx.run({ input: { date: new Date('2018-09-03T21:00Z') } }, () => {
      expect(dateInput().value).toBe('2018-09-03T21:00');

      setValue(dateInput(), '1980-11-04T10:00');
      expect(ctx.fixture.componentInstance.date).toEqual(
        new Date('1980-11-04T10:00Z'),
      );
    });
  });

  it('provides help for `onTouched`', () => {
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.innerText).not.toContain('Touched!');
      stringInput().dispatchEvent(new Event('blur'));
      expect(ctx.fixture.nativeElement.innerText).toContain('Touched!');
    });
  });

  it('provides help for `[disabled]`', () => {
    ctx.run({ input: { shouldDisable: true } }, () => {
      expect(stringInput().disabled).toBe(true);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(false);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(true);
    });
  });

  it('does not emit after an incoming change', () => {
    ctx.run(() => {
      expect(ctx.fixture.componentInstance.emissions).toBe(0);

      setValue(stringInput(), 'changed from within');
      expect(ctx.fixture.componentInstance.emissions).toBe(1);

      ctx.fixture.componentInstance.string = 'changed from without';
      ctx.fixture.detectChanges();
      flushMicrotasks();
      expect(ctx.fixture.componentInstance.emissions).toBe(1);

      click(toggleDisabledButton());
      click(toggleDisabledButton());
      expect(ctx.fixture.componentInstance.emissions).toBe(1);
    });
  });

  it('has the right class hierarchy', () => {
    ctx.run(() => {
      const component = ctx.fixture.debugElement.query(
        By.directive(StringComponent),
      ).componentInstance;
      expect(component instanceof InjectableSuperclass).toBe(true);
      expect(component instanceof DirectiveSuperclass).toBe(true);
      expect(component instanceof FormControlSuperclass).toBe(true);
    });
  });
});
