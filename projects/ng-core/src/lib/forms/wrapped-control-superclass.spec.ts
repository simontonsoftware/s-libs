import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  input,
} from '@angular/core';
import { flushMicrotasks } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RootStore } from '@s-libs/app-state';
import { keys, omit } from '@s-libs/micro-dash';
import { NasModelModule } from '@s-libs/ng-app-state';
import { ComponentContext, expectSingleCallAndReset } from '@s-libs/ng-dev';
import { EMPTY, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  click,
  find,
  findButton,
  findDirective,
  setValue,
} from '../../test-helpers';
import { DirectiveSuperclass } from '../directive-superclass';
import { InjectableSuperclass } from '../injectable-superclass';
import { FormComponentSuperclass } from './form-component-superclass';
import { provideValueAccessor } from './provide-value-accessor';
import { WrappedControlSuperclass } from './wrapped-control-superclass';

describe('WrappedControlSuperclass', () => {
  it('adds ng-touched to the inner form control at the right time', () => {
    @Component({
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
    })
    class NgTouchedComponent extends WrappedControlSuperclass<string> {
      protected control = new FormControl();
    }

    const ctx = new ComponentContext(NgTouchedComponent);
    ctx.run(() => {
      const debugElement = ctx.fixture.debugElement.query(By.css('input'));
      debugElement.triggerEventHandler('blur', {});
      ctx.tick();

      expect(debugElement.classes['ng-touched']).toBe(true);
    });
  });

  // There is some kind of tricky timing issue when using NasModel and WrappedControlSuperclass that required moving a subscription from `ngOnInit()` to `constructor()` to fix.
  it('catches the first incoming value from a nasModel', () => {
    @Component({
      selector: 'sl-wrapped-control',
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(WrappedControlComponent)],
    })
    class WrappedControlComponent extends WrappedControlSuperclass<string> {
      protected control = new FormControl();
    }

    @Component({
      imports: [WrappedControlComponent, NasModelModule],
      template: `<sl-wrapped-control [nasModel]="store('value')" />`,
    })
    class WrapperComponent {
      store = new RootStore({ value: 'initial value' });
    }

    const ctx = new ComponentContext(WrapperComponent);
    ctx.run(() => {
      const el = ctx.fixture.nativeElement;
      expect(el.querySelector('input')!.value).toBe('initial value');
    });
  });

  describe('translating between inner and outer formats', () => {
    it('allows setting up an observable to translate between inner and outer values', () => {
      @Component({
        selector: 'sl-observable-translation',
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ObservableTranslationComponent)],
      })
      class ObservableTranslationComponent extends WrappedControlSuperclass<
        number,
        string
      > {
        protected control = new FormControl();

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
        imports: [ObservableTranslationComponent, FormsModule],
        template: `<sl-observable-translation
          [ngModel]="38"
          (ngModelChange)="valueOut = $event"
        />`,
      })
      class WrapperComponent {
        valueOut?: number;
      }

      const ctx = new ComponentContext(WrapperComponent);
      ctx.run(() => {
        const inputEl: HTMLInputElement = ctx.fixture.debugElement.query(
          By.css('input'),
        ).nativeElement;
        expect(inputEl.value).toBe('19');

        setValue(inputEl, '6');
        ctx.tick();
        expect(ctx.getComponentInstance().valueOut).toBe(12);

        setValue(inputEl, "you can't double me");
        ctx.tick();
        expect(ctx.getComponentInstance().valueOut).toBe(12);
      });
    });

    it('gracefully handles an error in .innerToOuterValue()', () => {
      @Component({
        selector: `sl-error-in`,
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ErrorInComponent)],
      })
      class ErrorInComponent extends WrappedControlSuperclass<number> {
        override outerToInnerValue = jasmine.createSpy();
        protected control = new FormControl();
      }

      @Component({
        imports: [ErrorInComponent, FormsModule],
        template: `<sl-error-in [ngModel]="value()" />`,
      })
      class WrapperComponent {
        readonly value = input.required<string>();
      }

      const handleError = jasmine.createSpy();
      const ctx = new ComponentContext(WrapperComponent, {
        providers: [{ provide: ErrorHandler, useValue: { handleError } }],
      });
      ctx.run(async () => {
        const control: ErrorInComponent = ctx.fixture.debugElement.query(
          By.directive(ErrorInComponent),
        ).componentInstance;
        const inputEl: HTMLInputElement = ctx.fixture.debugElement.query(
          By.css('input'),
        ).nativeElement;

        const error = new Error();
        control.outerToInnerValue.and.throwError(error);
        ctx.assignInputs({ value: 'wont show' });
        expectSingleCallAndReset(handleError, error);
        expect(inputEl.value).toBe('');

        control.outerToInnerValue.and.returnValue('restored');
        ctx.assignInputs({ value: 'will show' });
        expect(inputEl.value).toBe('restored');
      });
    });

    it('gracefully handles an error in .outerToInnerValue()', () => {
      @Component({
        selector: `sl-error-out`,
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(ErrorOutComponent)],
      })
      class ErrorOutComponent extends WrappedControlSuperclass<number> {
        override innerToOuterValue = jasmine.createSpy();
        protected control = new FormControl();
      }

      @Component({
        imports: [ErrorOutComponent, FormsModule],
        template: `<sl-error-out [(ngModel)]="value" />`,
      })
      class WrapperComponent {
        value = 'initial value';
      }

      const handleError = jasmine.createSpy();
      const ctx = new ComponentContext(WrapperComponent, {
        providers: [{ provide: ErrorHandler, useValue: { handleError } }],
      });
      ctx.run(async () => {
        const wrapper = ctx.getComponentInstance();
        const control: ErrorOutComponent = ctx.fixture.debugElement.query(
          By.directive(ErrorOutComponent),
        ).componentInstance;
        const inputEl: HTMLInputElement = ctx.fixture.debugElement.query(
          By.css('input'),
        ).nativeElement;

        const error = new Error();
        control.innerToOuterValue.and.throwError(error);
        setValue(inputEl, 'wont show');
        expectSingleCallAndReset(handleError, error);
        expect(wrapper.value).toBe('initial value');

        control.innerToOuterValue.and.returnValue('restored');
        setValue(inputEl, 'will show');
        expect(wrapper.value).toBe('restored');
      });
    });
  });

  describe('validation', () => {
    it('works for simple transformations', () => {
      @Component({
        selector: 'sl-inner',
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" maxlength="2" />`,
        providers: [provideValueAccessor(InnerComponent)],
      })
      class InnerComponent extends WrappedControlSuperclass<string | null> {
        control = new FormControl('');

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
        imports: [InnerComponent, ReactiveFormsModule],
        template: `<sl-inner [formControl]="control" required />`,
      })
      class OuterComponent extends WrappedControlSuperclass<string | null> {
        control = new FormControl('');
      }

      const ctx = new ComponentContext(OuterComponent);
      ctx.run(async () => {
        const outer = ctx.getComponentInstance();
        const inner = findDirective(ctx, InnerComponent);
        const inputEl = find<HTMLInputElement>(ctx.fixture, 'input');

        expect(inner.control.errors).toBe(null);
        expect(outer.control.errors).toEqual({ required: true });

        setValue(inputEl, '123');
        expect(keys(inner.control.errors)).toEqual(['maxlength']);
        expect(outer.control.errors).toBe(null);
      });
    });

    it('works for complex transformations', () => {
      @Component({
        selector: 'sl-inner',
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" required />`,
        providers: [provideValueAccessor(InnerComponent)],
      })
      class InnerComponent extends WrappedControlSuperclass<string | null> {
        protected control = new FormControl('');

        // this is an example in the docs
        protected override setUpInnerToOuterErrors$(): Observable<ValidationErrors> {
          return EMPTY;
        }
      }

      @Component({
        imports: [InnerComponent, ReactiveFormsModule],
        template: `<sl-inner [formControl]="control" />`,
      })
      class OuterComponent extends WrappedControlSuperclass<string | null> {
        control = new FormControl('');
      }

      const ctx = new ComponentContext(OuterComponent);
      ctx.run(async () => {
        const outer = ctx.getComponentInstance();
        expect(outer.control.errors).toBe(null);
      });
    });

    describe('when there is an outer `NgControl`', () => {
      it('does not sync with ancestor controls', () => {
        @Component({
          selector: `sl-inner`,
          imports: [ReactiveFormsModule],
          template: `<input [formControl]="control" />`,
          providers: [provideValueAccessor(InnerComponent)],
        })
        class InnerComponent extends WrappedControlSuperclass<string | null> {
          control = new FormControl('');
        }

        @Component({
          selector: `sl-middle`,
          imports: [InnerComponent],
          template: `<sl-inner />`,
          providers: [provideValueAccessor(MiddleComponent)],
        })
        class MiddleComponent extends WrappedControlSuperclass<string | null> {
          control = new FormControl('');
        }

        @Component({
          imports: [MiddleComponent, FormsModule],
          template: `<sl-middle ngModel required />`,
        })
        class OuterComponent {}

        const ctx = new ComponentContext(OuterComponent);
        ctx.run(async () => {
          const innerControl = findDirective(ctx, InnerComponent).control;
          expect(innerControl.errors).toBe(null);
        });
      });

      it('syncs with all types of NgControls (production bug)', () => {
        // It was not syncing properly with `FormControlName`: https://github.com/simontonsoftware/s-libs/issues/82

        @Component({
          selector: 'sl-inner',
          imports: [ReactiveFormsModule],
          template: `<input [formControl]="control" />`,
          providers: [provideValueAccessor(InnerComponent)],
        })
        class InnerComponent extends WrappedControlSuperclass<string | null> {
          protected control = new FormControl('');
        }

        @Component({
          imports: [FormsModule, InnerComponent, ReactiveFormsModule],
          template: `
            <sl-inner id="model" [ngModel]="''" required />
            <sl-inner id="control" [formControl]="control" />
            <form [formGroup]="group">
              <sl-inner id="name" formControlName="inner" />
            </form>
          `,
        })
        class OuterComponent {
          protected control = new FormControl('', Validators.required);
          protected group = new FormGroup({
            inner: new FormControl('', Validators.required),
          });
        }

        const ctx = new ComponentContext(OuterComponent);
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

  describe('doc example', () => {
    it('works for the simple one', () => {
      // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv begin example
      @Component({
        imports: [ReactiveFormsModule],
        template: `<input [formControl]="control" />`,
        providers: [provideValueAccessor(StringComponent)],
      })
      class StringComponent extends WrappedControlSuperclass<string | null> {
        control = new FormControl('');
      }
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ end example

      const ctx = new ComponentContext(StringComponent);
      ctx.run(async () => {
        setValue(find<HTMLInputElement>(ctx.fixture, 'input'), 'hi');
        expect(ctx.getComponentInstance().control.value).toBe('hi');
      });
    });

    it('works for the one that modifies the value', () => {
      // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv begin example
      @Component({
        selector: 'sl-date',
        imports: [ReactiveFormsModule],
        template: `<input type="datetime-local" [formControl]="control" />`,
        providers: [provideValueAccessor(DateComponent)],
      })
      class DateComponent extends WrappedControlSuperclass<
        Date | null,
        string | null
      > {
        protected control = new FormControl<string | null>(null);

        protected override innerToOuterValue(
          inner: string | null,
        ): Date | null {
          return inner ? new Date(`${inner}Z`) : null;
        }

        protected override outerToInnerValue(
          outer: Date | null,
        ): string | null {
          return outer ? outer.toISOString().substring(0, 16) : null;
        }
      }
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ end example

      @Component({
        imports: [DateComponent, FormsModule],
        template: `<sl-date [(ngModel)]="date" />`,
      })
      class TestComponent {
        date = new Date();
      }

      const ctx = new ComponentContext(TestComponent);
      ctx.run(async () => {
        const inputEl = find<HTMLInputElement>(ctx.fixture, 'input');

        ctx.getComponentInstance().date = new Date('2018-09-03T21:00Z');
        ctx.tick();
        expect(inputEl.value).toBe('2018-09-03T21:00');

        setValue(inputEl, '1980-11-04T10:00');
        expect(ctx.getComponentInstance().date).toEqual(
          new Date('1980-11-04T10:00Z'),
        );
      });
    });

    it('works for the multiple inner components one', () => {
      // The idea for being able to wrap a form group came from github user A77AY: https://github.com/simontonsoftware/s-libs/pull/52

      // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv begin example
      class FullName {
        firstName = '';
        lastName = '';
      }

      @Component({
        selector: 'sl-full-name',
        imports: [ReactiveFormsModule],
        template: `
          <div [formGroup]="control">
            <input id="first" formControlName="firstName" />
            <input id="last" formControlName="lastName" />
          </div>
        `,
        providers: [provideValueAccessor(FullNameComponent)],
      })
      class FullNameComponent extends WrappedControlSuperclass<
        FullName | null,
        Partial<FullName>
      > {
        protected control = new FormGroup({
          firstName: new FormControl('', { nonNullable: true }),
          lastName: new FormControl('', { nonNullable: true }),
        });

        protected override outerToInnerValue(outer: FullName | null): FullName {
          // `formControlName` binding can't handle a null value
          return outer ?? new FullName();
        }

        protected override innerToOuterValue(
          inner: Partial<FullName>,
        ): FullName {
          // the values in a `FormGroup` can be `undefined` when their corresponding controls are disabled
          return {
            firstName: inner.firstName ?? '',
            lastName: inner.lastName ?? '',
          };
        }
      }
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ end example

      @Component({
        imports: [FullNameComponent, FormsModule],
        template: `
          <sl-full-name [ngModel]="fullName" [disabled]="disabled()" />
        `,
      })
      class TestComponent {
        readonly disabled = input(false);
        fullName = { firstName: 'Rinat', lastName: 'Arsaev' };
      }

      const ctx = new ComponentContext(TestComponent);
      ctx.run(async () => {
        const inputs = document.querySelectorAll('input');
        expect(inputs[0].value).toBe('Rinat');
        expect(inputs[1].value).toBe('Arsaev');

        expect(inputs[0].disabled).toBe(false);
        expect(inputs[1].disabled).toBe(false);
        ctx.assignInputs({ disabled: true });
        expect(inputs[0].disabled).toBe(true);
        expect(inputs[1].disabled).toBe(true);
      });
    });
  });
});

describe('WrappedControlSuperclass tests using an old style fixture', () => {
  @Component({
    selector: `sl-string-component`,
    imports: [ReactiveFormsModule],
    template: ` <input [formControl]="control" /> `,
    providers: [provideValueAccessor(StringComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class StringComponent extends WrappedControlSuperclass<string> {
    protected control = new FormControl();
  }

  @Component({
    imports: [FormsModule, StringComponent],
    template: `
      <sl-string-component
        [(ngModel)]="string"
        (ngModelChange)="emissions = emissions + 1"
        #stringControl="ngModel"
        [disabled]="shouldDisable"
      />
      @if (stringControl.touched) {
        <div>Touched!</div>
      }
      <button (click)="shouldDisable = !shouldDisable">Toggle Disabled</button>
    `,
  })
  class TestComponent {
    emissions = 0;
    string = '';
    shouldDisable = false;
  }

  class TestComponentContext extends ComponentContext<TestComponent> {
    constructor() {
      super(TestComponent);
    }
  }

  let ctx: TestComponentContext;
  beforeEach(() => {
    ctx = new TestComponentContext();
  });

  function stringInput(): HTMLInputElement {
    return find<HTMLInputElement>(ctx.fixture, 'sl-string-component input');
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
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      expect(component instanceof DirectiveSuperclass).toBe(true);
      expect(component instanceof FormComponentSuperclass).toBe(true);
    });
  });
});
