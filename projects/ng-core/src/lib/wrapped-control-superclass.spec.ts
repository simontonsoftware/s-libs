import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  flushMicrotasks,
} from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ComponentContext } from '@s-libs/ng-dev';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { click, find, findButton, setValue } from '../test-helpers';
import { DirectiveSuperclass } from './directive-superclass';
import {
  FormComponentSuperclass,
  provideValueAccessor,
} from './form-component-superclass';
import { InjectableSuperclass } from './injectable-superclass';
import { WrappedControlSuperclass } from './wrapped-control-superclass';

describe('WrappedControlSuperclass', () => {
  it('allows setting up an observable to translate between inner and outer values', () => {
    @Component({
      selector: 's-observable-translation',
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(ObservableTranslationComponent)],
    })
    class ObservableTranslationComponent extends WrappedControlSuperclass<
      number,
      string
    > {
      control = new FormControl();

      protected override setUpOuterToInner$(
        value$: Observable<number>,
      ): Observable<string> {
        return value$.pipe(map((outer) => String(outer / 2)));
      }

      protected override setUpInnerToOuter$(
        value$: Observable<string>,
      ): Observable<number> {
        return value$.pipe(
          map((inner) => +inner * 2),
          filter((val) => !isNaN(val)),
        );
      }
    }

    @Component({
      template: `
        <s-observable-translation
          [(ngModel)]="outerValue"
        ></s-observable-translation>
      `,
    })
    class WrapperComponent {
      @Input() outerValue!: number;
    }

    const ctx = new ComponentContext(WrapperComponent, {
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ObservableTranslationComponent],
    });
    ctx.assignInputs({ outerValue: 38 });
    ctx.run(() => {
      const input: HTMLInputElement = ctx.fixture.debugElement.query(
        By.css('input'),
      ).nativeElement;
      expect(input.value).toBe('19');

      setValue(input, '6');
      ctx.tick();
      expect(ctx.getComponentInstance().outerValue).toBe(12);

      setValue(input, "you can't double me");
      ctx.tick();
      expect(ctx.getComponentInstance().outerValue).toBe(12);
    });
  });

  it('adds ng-touched to the inner form control at the right time', () => {
    @Component({ template: `<input [formControl]="control" />` })
    class NgTouchedComponent extends WrappedControlSuperclass<string> {
      control = new FormControl();
    }

    const ctx = new ComponentContext(NgTouchedComponent, {
      imports: [ReactiveFormsModule],
    });
    ctx.run(() => {
      const debugElement = ctx.fixture.debugElement.query(By.css('input'));
      debugElement.triggerEventHandler('blur', {});
      ctx.tick();

      expect(debugElement.classes['ng-touched']).toBe(true);
    });
  });

  // https://github.com/simontonsoftware/s-libs/pull/52
  it('can wrap a form group', () => {
    class FullName {
      firstName = '';
      lastName = '';
    }

    @Component({
      selector: 's-full-name',
      template: `
        <div [formGroup]="control">
          <input id="first" formControlName="firstName" />
          <input id="last" formControlName="lastName" />
        </div>
      `,
      providers: [provideValueAccessor(FullNameComponent)],
    })
    class FullNameComponent extends WrappedControlSuperclass<FullName> {
      override control = new FormGroup({
        firstName: new FormControl(),
        lastName: new FormControl(),
      });

      protected override outerToInner(outer: FullName | null): FullName {
        // `outer` can come in as `null` during initialization when the user binds with `ngModel`
        return outer || new FullName();
      }
    }

    @Component({
      template: `
        <s-full-name [ngModel]="fullName" [disabled]="disabled"></s-full-name>
      `,
    })
    class FormComponent {
      @Input() disabled = false;
      fullName = { firstName: 'Krick', lastName: 'Ray' };
    }

    const ctx = new ComponentContext(FormComponent, {
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [FullNameComponent],
    });
    ctx.run(async () => {
      const inputs = document.querySelectorAll('input');
      expect(inputs[0].value).toBe('Krick');
      expect(inputs[1].value).toBe('Ray');

      expect(inputs[0].disabled).toBe(false);
      expect(inputs[1].disabled).toBe(false);
      ctx.assignInputs({ disabled: true });
      expect(inputs[0].disabled).toBe(true);
      expect(inputs[1].disabled).toBe(true);
    });
  });
});

describe('WrappedControlSuperclass tests using an old style fixture', () => {
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
    template: ` <input [formControl]="control" /> `,
    providers: [provideValueAccessor(StringComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class StringComponent extends WrappedControlSuperclass<string> {
    control = new FormControl();
  }

  @Component({
    selector: `s-date-component`,
    template: ` <input type="datetime-local" [formControl]="control" /> `,
    providers: [provideValueAccessor(DateComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class DateComponent extends WrappedControlSuperclass<Date, string> {
    control = new FormControl();

    protected override innerToOuter(value: string): Date {
      return new Date(value + 'Z');
    }

    protected override outerToInner(value: Date): string {
      if (value === null) {
        return ''; // happens during initialization
      }
      return value.toISOString().substr(0, 16);
    }
  }

  class TestComponentContext extends ComponentContext<TestComponent> {
    constructor() {
      super(TestComponent, {
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [DateComponent, StringComponent],
        // TODO: this can go away with component harnesses eventually
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
      });
    }
  }

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

  it('provides help for 2-way binding', () => {
    masterCtx.run(() => {
      masterCtx.getComponentInstance().string = 'initial value';
      masterCtx.tick();
      expect(stringInput().value).toBe('initial value');

      setValue(stringInput(), 'edited value');
      expect(masterCtx.getComponentInstance().string).toBe('edited value');
    });
  });

  it('can translate between inner and outer values', () => {
    masterCtx.run(() => {
      masterCtx.getComponentInstance().date = new Date('2018-09-03T21:00Z');
      masterCtx.tick();
      expect(dateInput().value).toBe('2018-09-03T21:00');

      setValue(dateInput(), '1980-11-04T10:00');
      expect(masterCtx.getComponentInstance().date).toEqual(
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
    masterCtx.run(() => {
      masterCtx.getComponentInstance().shouldDisable = true;
      masterCtx.tick();
      expect(stringInput().disabled).toBe(true);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(false);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(true);
    });
  });

  it('does not emit after an incoming change', () => {
    masterCtx.run(() => {
      expect(masterCtx.getComponentInstance().emissions).toBe(0);

      setValue(stringInput(), 'changed from within');
      expect(masterCtx.getComponentInstance().emissions).toBe(1);

      masterCtx.getComponentInstance().string = 'changed from without';
      masterCtx.fixture.detectChanges();
      flushMicrotasks();
      expect(masterCtx.getComponentInstance().emissions).toBe(1);

      click(toggleDisabledButton());
      click(toggleDisabledButton());
      expect(masterCtx.getComponentInstance().emissions).toBe(1);
    });
  });

  it('has the right class hierarchy', () => {
    masterCtx.run(() => {
      const component = masterCtx.fixture.debugElement.query(
        By.directive(StringComponent),
      ).componentInstance;
      expect(component instanceof InjectableSuperclass).toBe(true);
      expect(component instanceof DirectiveSuperclass).toBe(true);
      expect(component instanceof FormComponentSuperclass).toBe(true);
    });
  });
});
