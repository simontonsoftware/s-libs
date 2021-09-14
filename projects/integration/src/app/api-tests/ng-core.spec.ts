import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Inject,
  Injectable,
  Injector,
  Input,
} from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  flushMicrotasks,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { keys } from '@s-libs/micro-dash';
import * as ngCore from '@s-libs/ng-core';
import {
  DirectiveSuperclass,
  FormComponentSuperclass,
  InjectableSuperclass,
  mixInInjectableSuperclass,
  provideValueAccessor,
  WrappedFormControlSuperclass,
} from '@s-libs/ng-core';
import { ComponentContext, expectSingleCallAndReset } from '@s-libs/ng-dev';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

describe('ng-core', () => {
  describe('public API', () => {
    it('has DirectiveSuperclass', () => {
      expect(DirectiveSuperclass).toBeDefined();
    });

    it('has FormComponentSuperclass', () => {
      expect(FormComponentSuperclass).toBeDefined();
    });

    it('has InjectableSuperclass', () => {
      expect(InjectableSuperclass).toBeDefined();
    });

    it('has WrappedFormControlSuperclass', () => {
      expect(WrappedFormControlSuperclass).toBeDefined();
    });

    it('has mixInInjectableSuperclass', () => {
      expect(mixInInjectableSuperclass).toBeDefined();
    });

    it('has provideValueAccessor', () => {
      expect(provideValueAccessor).toBeDefined();
    });
  });

  describe('as a UMD bundle', () => {
    const bundle: typeof ngCore = (window as any).sLibs.ngCore;

    it('is available at sLibs.ngCore', () => {
      expect(keys(bundle)).toEqual(
        jasmine.arrayWithExactContents(keys(ngCore)),
      );
    });

    it('knows where to find @angular/core', () => {
      // DirectiveSuperclass uses @angular/core. This is one of its tests

      @Component({
        template: `
          <button (click)="toggle('prefix', 'Dark')">Dark</button>
          <button (click)="toggle('prefix2', 'Slate')">Slate</button>
          <button
            (click)="toggle('prefix', 'Dark'); toggle('prefix2', 'Slate')"
          >
            Both
          </button>
          <button (click)="hide = !hide">Hide</button>
          <s-color-text
            *ngIf="!hide"
            [prefix]="prefix"
            [prefix2]="prefix2"
          ></s-color-text>
        `,
      })
      class TestComponent {
        color$ = new BehaviorSubject('Green');
        prefix?: string;
        prefix2?: string;
        hide = false;

        toggle(key: 'prefix' | 'prefix2', value: string): void {
          this[key] = this[key] ? undefined : value;
        }
      }

      @Component({
        selector: 's-color-text',
        template: ` <span [style.background]="color">{{ color }}</span> `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class ColorTextComponent extends DirectiveSuperclass {
        @Input() prefix?: string;
        @Input() prefix2?: string;
        @Input() unspecified?: string;
        color!: string;

        constructor(
          @Inject('color$') color$: Observable<string>,
          injector: Injector,
        ) {
          super(injector);
          this.bindToInstance(
            'color',
            combineLatest([
              this.getInput$('prefix'),
              this.getInput$('prefix2'),
              color$,
            ]).pipe(map((parts) => parts.filter((p) => p).join(''))),
          );
        }
      }

      class TestComponentContext extends ComponentContext<TestComponent> {
        color$ = new BehaviorSubject('Grey');

        constructor() {
          super(TestComponent, {
            declarations: [ColorTextComponent],
            providers: [
              { provide: 'color$', useFactory: () => this.color$ },
              // this can go away with component harnesses eventually
              { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
          });
        }
      }
      const ctx = new TestComponentContext();

      function colorTextComponent(): ColorTextComponent {
        return ctx.fixture.debugElement.query(By.directive(ColorTextComponent))
          .componentInstance;
      }

      function darkButton(): HTMLButtonElement {
        return findButton(ctx.fixture, 'Dark');
      }

      function slateButton(): HTMLButtonElement {
        return findButton(ctx.fixture, 'Slate');
      }

      function bothButton(): HTMLButtonElement {
        return findButton(ctx.fixture, 'Both');
      }

      function click(element: Element): void {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        flushMicrotasks();
      }

      function findButton(
        fixture: ComponentFixture<any>,
        text: string,
      ): HTMLButtonElement {
        const found = fixture.debugElement.query(
          (candidate) =>
            candidate.nativeElement.nodeName === 'BUTTON' &&
            candidate.nativeElement.textContent.trim() === text,
        );
        if (found) {
          return found.nativeElement;
        } else {
          throw new Error('No button with text ' + text);
        }
      }
      ctx.run(() => {
        const stub = jasmine.createSpy();
        colorTextComponent().inputChanges$.subscribe(stub);
        expect(stub).not.toHaveBeenCalled();

        click(darkButton());
        expectSingleCallAndReset(stub, new Set(['prefix']));

        click(slateButton());
        expectSingleCallAndReset(stub, new Set(['prefix2']));

        click(bothButton());
        expectSingleCallAndReset(stub, new Set(['prefix', 'prefix2']));
      });
    });

    it('knows where to find @angular/forms', () => {
      // WrappedFormControlSuperclass uses @angular/forms. This is one of its tests

      @Component({
        template: `
          <s-string-component
            [(ngModel)]="string"
            (ngModelChange)="emissions = emissions + 1"
            #stringControl="ngModel"
            [disabled]="shouldDisable"
          ></s-string-component>
          <div *ngIf="stringControl.touched">Touched!</div>
          <button (click)="shouldDisable = !shouldDisable">
            Toggle Disabled
          </button>
          <hr />
          <s-date-component [(ngModel)]="date"></s-date-component>
        `,
      })
      class TestComponent {
        @Input() string = '';
        emissions = 0;
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
        template: `
          <input type="datetime-local" [formControl]="formControl" />
        `,
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
        constructor() {
          super(TestComponent, {
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [DateComponent, StringComponent],
            // this can go away with component harnesses eventually
            providers: [
              { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
          });
        }
      }
      const ctx = new TestComponentContext();

      function stringInput(): HTMLInputElement {
        return find<HTMLInputElement>(ctx.fixture, 's-string-component input');
      }

      function find<T extends Element>(
        fixture: ComponentFixture<any>,
        cssSelector: string,
      ): T {
        const found = fixture.nativeElement.querySelector(cssSelector) as T;
        if (found) {
          return found;
        } else {
          throw new Error('could not find ' + cssSelector);
        }
      }

      function setValue(input: HTMLInputElement, value: string): void {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        flushMicrotasks();
      }

      ctx.assignInputs({ string: 'initial value' });
      ctx.run(() => {
        expect(stringInput().value).toBe('initial value');

        setValue(stringInput(), 'edited value');
        expect(ctx.getComponentInstance().string).toBe('edited value');
      });
    });

    it('knows where to find micro-dash', () => {
      // FormComponentSuperclass uses micro-dash. This is one of its tests

      @Component({
        template: `
          <s-counter-component
            [(ngModel)]="value"
            #counter="ngModel"
            [disabled]="shouldDisable"
          ></s-counter-component>
          <div *ngIf="counter.touched">Touched!</div>
          <button (click)="shouldDisable = !shouldDisable">
            Toggle Disabled
          </button>
        `,
      })
      class TestComponent {
        @Input() value = 0;
        @Input() shouldDisable = false;
      }

      @Component({
        selector: `s-counter-component`,
        template: `
          <button (click)="increment()" [disabled]="isDisabled">
            {{ counter }}
          </button>
        `,
        providers: [provideValueAccessor(CounterComponent)],
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class CounterComponent extends FormComponentSuperclass<number> {
        counter = 0;

        constructor(injector: Injector) {
          super(injector);
        }

        handleIncomingValue(value: number): void {
          this.counter = value;
        }

        increment(): void {
          this.emitOutgoingValue(++this.counter);
          this.onTouched();
        }
      }

      class TestComponentContext extends ComponentContext<TestComponent> {
        constructor() {
          super(TestComponent, {
            imports: [FormsModule],
            declarations: [CounterComponent],
            // this can go away with component harnesses eventually
            providers: [
              { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
          });
        }
      }
      const ctx = new TestComponentContext();

      function incrementButton(): HTMLButtonElement {
        return find<HTMLButtonElement>(
          ctx.fixture,
          's-counter-component button',
        );
      }

      function toggleDisabledButton(): HTMLButtonElement {
        return findButton(ctx.fixture, 'Toggle Disabled');
      }

      function findButton(
        fixture: ComponentFixture<any>,
        text: string,
      ): HTMLButtonElement {
        const found = fixture.debugElement.query(
          (candidate) =>
            candidate.nativeElement.nodeName === 'BUTTON' &&
            candidate.nativeElement.textContent.trim() === text,
        );
        if (found) {
          return found.nativeElement;
        } else {
          throw new Error('No button with text ' + text);
        }
      }

      function find<T extends Element>(
        fixture: ComponentFixture<any>,
        cssSelector: string,
      ): T {
        const found = fixture.nativeElement.querySelector(cssSelector) as T;
        if (found) {
          return found;
        } else {
          throw new Error('could not find ' + cssSelector);
        }
      }

      function click(element: Element): void {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        flushMicrotasks();
      }

      ctx.assignInputs({ shouldDisable: true });
      ctx.run(() => {
        expect(incrementButton().disabled).toBe(true);

        click(toggleDisabledButton());
        expect(incrementButton().disabled).toBe(false);
      });
    });

    it('knows where to find rxjs-core', () => {
      // InjectableSuperclass uses rxjs-core. This is one of its tests

      @Injectable()
      class DestroyableService extends InjectableSuperclass {}

      @Directive({
        selector: `[sDestroyableDirective]`,
        providers: [DestroyableService],
      })
      class DestroyableDirective extends InjectableSuperclass {
        constructor(subject: Subject<any>, public service: DestroyableService) {
          super();
          this.subscribeTo(subject);
          service.subscribeTo(subject);
        }
      }

      @Component({
        template: `<p *ngIf="showThings" sDestroyableDirective>
          I'm showing.
        </p>`,
      })
      class TestComponent {
        showThings = true;
      }

      class TestComponentContext extends ComponentContext<TestComponent> {
        subject = new Subject();

        constructor() {
          super(TestComponent, {
            declarations: [DestroyableDirective],
            providers: [{ provide: Subject, useFactory: () => this.subject }],
          });
        }
      }
      const ctx = new TestComponentContext();
      ctx.run(() => {
        expect(ctx.subject.observers.length).toBe(2);

        ctx.getComponentInstance().showThings = false;
        ctx.fixture.detectChanges();
        expect(ctx.subject.observers.length).toBe(0);
      });
    });
  });
});
