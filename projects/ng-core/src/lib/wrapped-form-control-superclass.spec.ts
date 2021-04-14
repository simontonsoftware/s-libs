import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  flushMicrotasks,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ComponentContext, ComponentContextNext } from '@s-libs/ng-dev';
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
  let masterCtx: TestComponentContext;
  beforeEach(() => {
    masterCtx = new TestComponentContext();
  });

  function stringInput(): HTMLInputElement {
    return find<HTMLInputElement>(
      masterCtx.fixture,
      's-string-component input',
    );
  }

  function dateInput(): HTMLInputElement {
    return find<HTMLInputElement>(masterCtx.fixture, 's-date-component input');
  }

  function toggleDisabledButton(): HTMLButtonElement {
    return findButton(masterCtx.fixture, 'Toggle Disabled');
  }

  ///////

  it('provides help for 2-way binding', () => {
    masterCtx.run({ input: { string: 'initial value' } }, () => {
      expect(stringInput().value).toBe('initial value');

      setValue(stringInput(), 'edited value');
      expect(masterCtx.fixture.componentInstance.string).toBe('edited value');
    });
  });

  it('can translate between inner and outer values', () => {
    masterCtx.run({ input: { date: new Date('2018-09-03T21:00Z') } }, () => {
      expect(dateInput().value).toBe('2018-09-03T21:00');

      setValue(dateInput(), '1980-11-04T10:00');
      expect(masterCtx.fixture.componentInstance.date).toEqual(
        new Date('1980-11-04T10:00Z'),
      );
    });
  });

  it('provides help for `onTouched`', () => {
    masterCtx.run(() => {
      expect(masterCtx.fixture.nativeElement.innerText).not.toContain(
        'Touched!',
      );
      stringInput().dispatchEvent(new Event('blur'));
      expect(masterCtx.fixture.nativeElement.innerText).toContain('Touched!');
    });
  });

  it('provides help for `[disabled]`', () => {
    masterCtx.run({ input: { shouldDisable: true } }, () => {
      expect(stringInput().disabled).toBe(true);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(false);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(true);
    });
  });

  it('does not emit after an incoming change', () => {
    masterCtx.run(() => {
      expect(masterCtx.fixture.componentInstance.emissions).toBe(0);

      setValue(stringInput(), 'changed from within');
      expect(masterCtx.fixture.componentInstance.emissions).toBe(1);

      masterCtx.fixture.componentInstance.string = 'changed from without';
      masterCtx.fixture.detectChanges();
      flushMicrotasks();
      expect(masterCtx.fixture.componentInstance.emissions).toBe(1);

      click(toggleDisabledButton());
      click(toggleDisabledButton());
      expect(masterCtx.fixture.componentInstance.emissions).toBe(1);
    });
  });

  it('has the right class hierarchy', () => {
    masterCtx.run(() => {
      const component = masterCtx.fixture.debugElement.query(
        By.directive(StringComponent),
      ).componentInstance;
      expect(component instanceof InjectableSuperclass).toBe(true);
      expect(component instanceof DirectiveSuperclass).toBe(true);
      expect(component instanceof FormControlSuperclass).toBe(true);
    });
  });

  it('adds ng-touched to the inner form control at the right time', () => {
    @Component({ template: `<input [formControl]="formControl" />` })
    class NgTouchedComponent extends WrappedFormControlSuperclass<string> {
      constructor(injector: Injector) {
        super(injector);
      }
    }

    const ctx = new ComponentContextNext(NgTouchedComponent);
    ctx.run(() => {
      const debugElement = ctx.fixture.debugElement.query(By.css('input'));
      debugElement.triggerEventHandler('blur', {});
      ctx.tick();

      expect(debugElement.classes['ng-touched']).toBe(true);
    });
  });
});
