import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  Input,
} from '@angular/core';
import { flushMicrotasks } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { keys, omit } from '@s-libs/micro-dash';
import { ComponentContext, expectSingleCallAndReset } from '@s-libs/ng-dev';
import { EMPTY, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  click,
  find,
  findButton,
  findDirective,
  setValue,
} from '../test-helpers';
import { DirectiveSuperclass } from './directive-superclass';
import { FormComponentSuperclass } from './form-component-superclass';
import { InjectableSuperclass } from './injectable-superclass';
import { provideValueAccessor } from './provide-value-accessor';
import { WrappedControlSuperclass } from './wrapped-control-superclass';
import { WrappedFormControlSuperclass } from './wrapped-form-control-superclass';

describe('WrappedControlSuperclass', () => {
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
      selector: 'sl-full-name',
      template: `
        <div [formGroup]="control">
          <input id="first" formControlName="firstName" />
          <input id="last" formControlName="lastName" />
        </div>
      `,
      providers: [provideValueAccessor(FullNameComponent)],
    })
    class FullNameComponent extends WrappedControlSuperclass<FullName> {
      override control = new UntypedFormGroup({
        firstName: new FormControl(),
        lastName: new FormControl(),
      });

      protected override outerToInnerValue(outer: FullName | null): FullName {
        // `outer` can come in as `null` during initialization when the user binds with `ngModel`
        return outer ?? new FullName();
      }
    }

    @Component({
      template: `
        <sl-full-name [ngModel]="fullName" [disabled]="disabled"></sl-full-name>
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

  describe('translating between inner and outer formats', () => {
    it('allows setting up an observable to translate between inner and outer values', () => {
      @Component({
        selector: 'sl-observable-translation',
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ObservableTranslationComponent)],
      })
      class ObservableTranslationComponent extends WrappedControlSuperclass<
        number,
        string
      > {
        control = new FormControl();

        protected override setUpOuterToInnerValue$(
          value$: Observable<number>,
        ): Observable<string> {
          return value$.pipe(map((outer) => String(outer / 2)));
        }

        protected override setUpInnerToOuterValue$(
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
          <sl-observable-translation
            [(ngModel)]="outerValue"
          ></sl-observable-translation>
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

    it('gracefully handles an error in .innerToOuterValue()', () => {
      @Component({
        selector: `sl-error-in`,
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ErrorInComponent)],
      })
      class ErrorInComponent extends WrappedControlSuperclass<number> {
        control = new FormControl();
        override outerToInnerValue = jasmine.createSpy();
      }

      @Component({
        template: `<sl-error-in [(ngModel)]="value"></sl-error-in>`,
      })
      class WrapperComponent {
        @Input() value!: string;
      }

      const handleError = jasmine.createSpy();
      const ctx = new ComponentContext(WrapperComponent, {
        declarations: [ErrorInComponent],
        imports: [FormsModule, ReactiveFormsModule],
        providers: [{ provide: ErrorHandler, useValue: { handleError } }],
      });
      ctx.run(async () => {
        const control: ErrorInComponent = ctx.fixture.debugElement.query(
          By.directive(ErrorInComponent),
        ).componentInstance;
        const input: HTMLInputElement = ctx.fixture.debugElement.query(
          By.css('input'),
        ).nativeElement;

        const error = new Error();
        control.outerToInnerValue.and.throwError(error);
        ctx.assignInputs({ value: 'wont show' });
        expectSingleCallAndReset(handleError, error);
        expect(input.value).toBe('');

        control.outerToInnerValue.and.returnValue('restored');
        ctx.assignInputs({ value: 'will show' });
        expect(input.value).toBe('restored');
      });
    });

    it('gracefully handles an error in .outerToInnerValue()', () => {
      @Component({
        selector: `sl-error-out`,
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ErrorOutComponent)],
      })
      class ErrorOutComponent extends WrappedControlSuperclass<number> {
        control = new FormControl();
        override innerToOuterValue = jasmine.createSpy();
      }

      @Component({
        template: ` <sl-error-out [(ngModel)]="value"></sl-error-out>`,
      })
      class WrapperComponent {
        value = 'initial value';
      }

      const handleError = jasmine.createSpy();
      const ctx = new ComponentContext(WrapperComponent, {
        declarations: [ErrorOutComponent],
        imports: [FormsModule, ReactiveFormsModule],
        providers: [{ provide: ErrorHandler, useValue: { handleError } }],
      });
      ctx.run(async () => {
        const wrapper = ctx.getComponentInstance();
        const control: ErrorOutComponent = ctx.fixture.debugElement.query(
          By.directive(ErrorOutComponent),
        ).componentInstance;
        const input: HTMLInputElement = ctx.fixture.debugElement.query(
          By.css('input'),
        ).nativeElement;

        const error = new Error();
        control.innerToOuterValue.and.throwError(error);
        setValue(input, 'wont show');
        expectSingleCallAndReset(handleError, error);
        expect(wrapper.value).toBe('initial value');

        control.innerToOuterValue.and.returnValue('restored');
        setValue(input, 'will show');
        expect(wrapper.value).toBe('restored');
      });
    });
  });

  describe('validation', () => {
    it('works for simple transformations', () => {
      @Component({
        selector: 'sl-inner',
        template: `<input [formControl]="control" maxlength="2" />`,
        providers: [provideValueAccessor(InnerComponent)],
      })
      class InnerComponent extends WrappedFormControlSuperclass<string> {
        // this is an example in the docs
        protected override outerToInnerErrors(
          errors: ValidationErrors,
        ): ValidationErrors {
          return omit(errors, 'required');
        }

        protected override innerToOuterErrors(
          errors: ValidationErrors,
        ): ValidationErrors {
          return omit(errors, 'maxlength');
        }
      }

      @Component({
        template: `<sl-inner [formControl]="control" required></sl-inner>`,
      })
      class OuterComponent extends WrappedFormControlSuperclass<string> {}

      const ctx = new ComponentContext(OuterComponent, {
        imports: [ReactiveFormsModule],
        declarations: [InnerComponent],
      });
      ctx.run(async () => {
        const outer = ctx.getComponentInstance();
        const inner = findDirective(ctx, InnerComponent);
        const input = find<HTMLInputElement>(ctx.fixture, 'input');

        expect(inner.control.errors).toBe(null);
        expect(outer.control.errors).toEqual({ required: true });

        setValue(input, '123');
        expect(keys(inner.control.errors)).toEqual(['maxlength']);
        expect(outer.control.errors).toBe(null);
      });
    });

    it('works for complex transformations', () => {
      @Component({
        selector: 'sl-inner',
        template: `<input [formControl]="control" required />`,
        providers: [provideValueAccessor(InnerComponent)],
      })
      class InnerComponent extends WrappedFormControlSuperclass<string> {
        // this is an example in the docs
        protected override setUpInnerToOuterErrors$(): Observable<ValidationErrors> {
          return EMPTY;
        }
      }

      @Component({
        template: `<sl-inner [formControl]="control"></sl-inner>`,
      })
      class OuterComponent extends WrappedFormControlSuperclass<string> {}

      const ctx = new ComponentContext(OuterComponent, {
        imports: [ReactiveFormsModule],
        declarations: [InnerComponent],
      });
      ctx.run(async () => {
        const outer = ctx.getComponentInstance();
        expect(outer.control.errors).toBe(null);
      });
    });

    describe('when there is an outer `NgControl`', () => {
      it('does not sync with ancestor controls', () => {
        @Component({
          selector: `sl-inner`,
          template: `<input [formControl]="control" />`,
          providers: [provideValueAccessor(InnerComponent)],
        })
        class InnerComponent extends WrappedFormControlSuperclass<string> {}

        @Component({
          selector: `sl-middle`,
          template: `<sl-inner></sl-inner>`,
          providers: [provideValueAccessor(MiddleComponent)],
        })
        class MiddleComponent extends WrappedFormControlSuperclass<string> {}

        @Component({ template: `<sl-middle ngModel required></sl-middle>` })
        class OuterComponent {}

        const ctx = new ComponentContext(OuterComponent, {
          imports: [FormsModule, ReactiveFormsModule],
          declarations: [InnerComponent, MiddleComponent],
        });
        ctx.run(async () => {
          const innerControl = findDirective(ctx, InnerComponent).control;
          expect(innerControl.errors).toBe(null);
        });
      });

      it('syncs with all types of NgControls (production bug)', () => {
        // It was not syncing properly with `FormControlName`: https://github.com/simontonsoftware/s-libs/issues/82

        @Component({
          selector: 'sl-inner',
          template: `<input [formControl]="control" />`,
          providers: [provideValueAccessor(InnerComponent)],
        })
        class InnerComponent extends WrappedFormControlSuperclass<string> {}

        @Component({
          template: `
            <sl-inner id="model" [ngModel]="''" required></sl-inner>
            <sl-inner id="control" [formControl]="control"></sl-inner>
            <form [formGroup]="group">
              <sl-inner id="name" formControlName="inner"></sl-inner>
            </form>
          `,
        })
        class OuterComponent {
          control = new FormControl('', Validators.required);
          group = new FormGroup({
            inner: new FormControl('', Validators.required),
          });
        }

        const ctx = new ComponentContext(OuterComponent, {
          imports: [FormsModule, ReactiveFormsModule],
          declarations: [InnerComponent],
        });
        ctx.run(async () => {
          const model = ctx.fixture.debugElement.query(
            By.css('#model'),
          ).componentInstance;
          const control = ctx.fixture.debugElement.query(
            By.css('#control'),
          ).componentInstance;
          const name = ctx.fixture.debugElement.query(
            By.css('#name'),
          ).componentInstance;

          expect(model.control.errors).toEqual({ required: true });
          expect(control.control.errors).toEqual({ required: true });
          expect(name.control.errors).toEqual({ required: true });
        });
      });
    });
  });
});

describe('WrappedControlSuperclass tests using an old style fixture', () => {
  @Component({
    template: `
      <sl-string-component
        [(ngModel)]="string"
        (ngModelChange)="emissions = emissions + 1"
        #stringControl="ngModel"
        [disabled]="shouldDisable"
      ></sl-string-component>
      <div *ngIf="stringControl.touched">Touched!</div>
      <button (click)="shouldDisable = !shouldDisable">Toggle Disabled</button>
      <hr />
      <sl-date-component [(ngModel)]="date"></sl-date-component>
    `,
  })
  class TestComponent {
    emissions = 0;
    string = '';
    date = new Date();
    shouldDisable = false;
  }

  @Component({
    selector: `sl-string-component`,
    template: ` <input [formControl]="control" /> `,
    providers: [provideValueAccessor(StringComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class StringComponent extends WrappedControlSuperclass<string> {
    control = new FormControl();
  }

  @Component({
    selector: `sl-date-component`,
    template: ` <input type="datetime-local" [formControl]="control" /> `,
    providers: [provideValueAccessor(DateComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class DateComponent extends WrappedControlSuperclass<Date, string> {
    control = new FormControl();

    protected override innerToOuterValue(value: string): Date {
      return new Date(`${value}Z`);
    }

    protected override outerToInnerValue(value: Date): string {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- happens during initialization
      if (value === null) {
        return '';
      }
      return value.toISOString().substr(0, 16);
    }
  }

  class TestComponentContext extends ComponentContext<TestComponent> {
    constructor() {
      super(TestComponent, {
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [DateComponent, StringComponent],
      });
    }
  }

  let ctx: TestComponentContext;
  beforeEach(() => {
    ctx = new TestComponentContext();
  });

  function stringInput(): HTMLInputElement {
    return find<HTMLInputElement>(ctx.fixture, 'sl-string-component input');
  }

  function dateInput(): HTMLInputElement {
    return find<HTMLInputElement>(ctx.fixture, 'sl-date-component input');
  }

  function toggleDisabledButton(): HTMLButtonElement {
    return findButton(ctx.fixture, 'Toggle Disabled');
  }

  it('provides help for 2-way binding', () => {
    ctx.run(() => {
      ctx.getComponentInstance().string = 'initial value';
      ctx.tick();
      expect(stringInput().value).toBe('initial value');

      setValue(stringInput(), 'edited value');
      expect(ctx.getComponentInstance().string).toBe('edited value');
    });
  });

  it('can translate between inner and outer values', () => {
    ctx.run(() => {
      ctx.getComponentInstance().date = new Date('2018-09-03T21:00Z');
      ctx.tick();
      expect(dateInput().value).toBe('2018-09-03T21:00');

      setValue(dateInput(), '1980-11-04T10:00');
      expect(ctx.getComponentInstance().date).toEqual(
        new Date('1980-11-04T10:00Z'),
      );
    });
  });

  it('provides help for `onTouched`', () => {
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.innerText).not.toContain('Touched!');
      stringInput().dispatchEvent(new Event('blur'));
      ctx.tick();
      expect(ctx.fixture.nativeElement.innerText).toContain('Touched!');
    });
  });

  it('provides help for `[disabled]`', () => {
    ctx.run(() => {
      ctx.getComponentInstance().shouldDisable = true;
      ctx.tick();
      expect(stringInput().disabled).toBe(true);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(false);

      click(toggleDisabledButton());
      expect(stringInput().disabled).toBe(true);
    });
  });

  it('does not emit after an incoming change', () => {
    ctx.run(() => {
      expect(ctx.getComponentInstance().emissions).toBe(0);

      setValue(stringInput(), 'changed from within');
      expect(ctx.getComponentInstance().emissions).toBe(1);

      ctx.getComponentInstance().string = 'changed from without';
      ctx.fixture.detectChanges();
      flushMicrotasks();
      expect(ctx.getComponentInstance().emissions).toBe(1);

      click(toggleDisabledButton());
      click(toggleDisabledButton());
      expect(ctx.getComponentInstance().emissions).toBe(1);
    });
  });

  it('has the right class hierarchy', () => {
    ctx.run(() => {
      const component = ctx.fixture.debugElement.query(
        By.directive(StringComponent),
      ).componentInstance;
      expect(component instanceof InjectableSuperclass).toBe(true);
      expect(component instanceof DirectiveSuperclass).toBe(true);
      expect(component instanceof FormComponentSuperclass).toBe(true);
    });
  });
});
