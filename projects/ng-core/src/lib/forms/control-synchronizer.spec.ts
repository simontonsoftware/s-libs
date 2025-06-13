import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { assert, Deferred } from '@s-libs/js-core';
import { AngularContext, ComponentContext } from '@s-libs/ng-dev';
import { logValues } from '@s-libs/rxjs-core';
import { delayWhen, Observable, Subject } from 'rxjs';
import {
  provideValueAccessor,
  WrappedControlSuperclass,
} from '../../public-api';
import { find, findDirective, setValue } from '../../test-helpers';

abstract class AbstractValidatingComponent extends WrappedControlSuperclass<
  string,
  string | null
> {
  syncError = false;
  control = new FormControl<string | null>(null, () =>
    this.#makeError(this.syncError, 'Sync'),
  );
  failOnNeedlessAsync = false;

  #deferred?: Deferred<ValidationErrors | null>;

  constructor(
    private tag: string,
    { syncError = false, doAsyncValidation = false } = {},
  ) {
    super();
    this.syncError = syncError;
    if (doAsyncValidation) {
      this.control.addAsyncValidators(
        async (): Promise<ValidationErrors | null> => {
          // console.log(this.tag, 'starting async validator');
          if (this.#deferred) {
            // console.warn('async starting before last finished');
            expect(this.failOnNeedlessAsync).toBe(false);
          }
          this.#deferred = new Deferred();
          return this.#deferred.promise;
        },
      );
    }
  }

  flushAsyncWith(error: boolean): void {
    // console.log(this.tag, 'resolving', { error });
    assert(this.#deferred, `${this.tag} has no pending validation to flush`);
    this.#deferred.resolve(this.#makeError(error, 'Async'));
    this.#deferred = undefined;
    AngularContext.getCurrent()!.tick();
  }

  #makeError(error: boolean, suffix: string): ValidationErrors | null {
    if (error) {
      // console.log(this.tag, suffix, 'validating with', {
      //   [this.tag + suffix]: true,
      // });
      return { [this.tag + suffix]: true };
    } else {
      // console.log(this.tag, suffix, 'validating with null');
      return null;
    }
  }
}

describe('ControlSynchronizer', () => {
  it('synchronizes validation 2 ways', () => {
    @Component({
      selector: `sl-inner`,
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(InnerComponent)],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class InnerComponent extends AbstractValidatingComponent {
      constructor() {
        super('inner');
      }
    }

    @Component({
      imports: [InnerComponent, ReactiveFormsModule],
      template: `<sl-inner [formControl]="control" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OuterComponent extends AbstractValidatingComponent {
      constructor() {
        super('outer', { syncError: true });
      }
    }

    const ctx = new ComponentContext(OuterComponent);
    ctx.run(async () => {
      const outer = ctx.getComponentInstance();
      const inner = findDirective(ctx, InnerComponent);
      const inputEl = find<HTMLInputElement>(ctx.fixture, 'input');

      // without sync runs: inner outer inner
      expect(inner.control.errors).toEqual({ outerSync: true });
      expect(outer.control.errors).toEqual({ outerSync: true });

      // without sync runs: inner outer
      // console.log('------------------------------------- outer off, inner on');
      outer.syncError = false;
      inner.syncError = true;
      setValue(inputEl, '1');
      expect(inner.control.errors).toEqual({ innerSync: true });
      expect(outer.control.errors).toEqual({ innerSync: true });

      // without sync runs: inner outer
      // console.log('----------------------------------------------- inner off');
      inner.syncError = false;
      setValue(inputEl, '2');
      expect(inner.control.errors).toBe(null);
      expect(outer.control.errors).toBe(null);

      // inner turns on
      // without sync runs: inner outer
      // console.log('------------------------------------------------ inner on');
      inner.syncError = true;
      setValue(inputEl, '3');
      expect(inner.control.errors).toEqual({ innerSync: true });
      expect(outer.control.errors).toEqual({ innerSync: true });

      // outer turns on, inner turns off
      // without sync runs: inner outer
      // console.log('------------------------------------- outer on, inner off');
      outer.syncError = true;
      inner.syncError = false;
      setValue(inputEl, '4');
      expect(inner.control.errors).toEqual({ outerSync: true });
      expect(outer.control.errors).toEqual({ outerSync: true });
    });
  });

  it('handles async validation', () => {
    @Component({
      selector: `sl-inner`,
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(InnerComponent)],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class InnerComponent extends AbstractValidatingComponent {
      constructor() {
        super('inner', { doAsyncValidation: true });
      }
    }

    @Component({
      imports: [InnerComponent, ReactiveFormsModule],
      template: `<sl-inner [formControl]="control" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OuterComponent extends AbstractValidatingComponent {
      constructor() {
        super('outer', { doAsyncValidation: true });
      }
    }

    const ctx = new ComponentContext(OuterComponent);
    ctx.run(async () => {
      const outer = ctx.getComponentInstance();
      const inner = findDirective(ctx, InnerComponent);
      const inputEl = find<HTMLInputElement>(ctx.fixture, 'input');
      outer.failOnNeedlessAsync = true;
      inner.failOnNeedlessAsync = true;

      // on init, inner is on
      outer.flushAsyncWith(false);
      inner.flushAsyncWith(true);
      expect(inner.control.errors).toEqual({ innerAsync: true });
      expect(outer.control.errors).toEqual({ innerAsync: true });

      // console.log('------------------------------------- outer on, inner off');
      setValue(inputEl, '2');
      inner.flushAsyncWith(false);
      outer.flushAsyncWith(true);
      expect(inner.control.errors).toEqual({ outerAsync: true });
      expect(outer.control.errors).toEqual({ outerAsync: true });

      // console.log('----------------------------------------------- outer off');
      setValue(inputEl, '3');
      outer.flushAsyncWith(false);
      inner.flushAsyncWith(false);
      expect(inner.control.errors).toBe(null);
      expect(outer.control.errors).toBe(null);

      // console.log('------------------------------------------------ outer on');
      setValue(inputEl, '4');
      inner.flushAsyncWith(false);
      outer.flushAsyncWith(true);
      expect(inner.control.errors).toEqual({ outerAsync: true });
      expect(outer.control.errors).toEqual({ outerAsync: true });

      // bug during dev
      // console.log('------------------------------------- outer off, inner on');
      setValue(inputEl, '5');
      outer.flushAsyncWith(false);
      inner.flushAsyncWith(true);
      expect(inner.control.errors).toEqual({ innerAsync: true });
      expect(outer.control.errors).toEqual({ innerAsync: true });
    });
  });

  it('handles delays when transforming errors', () => {
    @Component({
      selector: `sl-inner`,
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(InnerComponent)],
    })
    class InnerComponent extends AbstractValidatingComponent {
      outerToInnerDelay$ = new Subject();
      innerToOuterDelay$ = new Subject();

      constructor() {
        super('inner', { syncError: true });
      }

      protected override setUpOuterToInnerErrors$(
        outer$: Observable<ValidationErrors>,
      ): Observable<ValidationErrors> {
        return super.setUpOuterToInnerErrors$(outer$).pipe(
          logValues('outerToInner delaying'),
          delayWhen(() => this.outerToInnerDelay$),
        );
      }

      protected override setUpInnerToOuterErrors$(
        inner$: Observable<ValidationErrors>,
      ): Observable<ValidationErrors> {
        return super.setUpInnerToOuterErrors$(inner$).pipe(
          logValues('innerToOuter delaying'),
          delayWhen(() => this.innerToOuterDelay$),
        );
      }
    }

    @Component({
      imports: [InnerComponent, ReactiveFormsModule],
      template: `<sl-inner [formControl]="control" />`,
    })
    class OuterComponent extends AbstractValidatingComponent {
      constructor() {
        super('outer', { syncError: true });
      }
    }

    const ctx = new ComponentContext(OuterComponent);
    ctx.run(async () => {
      const outer = ctx.getComponentInstance();
      const inner = findDirective(ctx, InnerComponent);
      const inputEl = find<HTMLInputElement>(ctx.fixture, 'input');

      expect(inner.control.errors).toEqual({ innerSync: true });
      expect(outer.control.errors).toEqual({ outerSync: true });

      inner.outerToInnerDelay$.next(undefined);
      expect(inner.control.errors).toEqual({
        outerSync: true,
        innerSync: true,
      });
      expect(outer.control.errors).toEqual({ outerSync: true });

      inner.innerToOuterDelay$.next(undefined);
      expect(inner.control.errors).toEqual({
        outerSync: true,
        innerSync: true,
      });
      expect(outer.control.errors).toEqual({
        outerSync: true,
        innerSync: true,
      });

      inner.syncError = false;
      outer.syncError = false;
      setValue(inputEl, '1');
      expect(inner.control.errors).toEqual({ outerSync: true });
      expect(outer.control.errors).toEqual({ innerSync: true });

      inner.innerToOuterDelay$.next(undefined);
      expect(inner.control.errors).toEqual({ outerSync: true });
      expect(outer.control.errors).toBe(null);

      inner.outerToInnerDelay$.next(undefined);
      expect(inner.control.errors).toBe(null);
      expect(outer.control.errors).toBe(null);
    });
  });

  it('cleans up subscriptions', () => {
    let synchronizationHappened = false;

    @Component({
      selector: 'sl-inner',
      imports: [ReactiveFormsModule],
      template: `<input [formControl]="control" />`,
      providers: [provideValueAccessor(InnerComponent)],
    })
    class InnerComponent extends WrappedControlSuperclass<string | null> {
      control = new FormControl('');

      protected override outerToInnerErrors(
        errors: ValidationErrors,
      ): ValidationErrors {
        synchronizationHappened = true;
        return super.outerToInnerErrors(errors);
      }
    }

    @Component({
      imports: [InnerComponent, ReactiveFormsModule],
      template: `@if (showInner()) {
        <sl-inner [formControl]="control" />
      }`,
    })
    class OuterComponent extends WrappedControlSuperclass<string | null> {
      readonly showInner = input.required<boolean>();
      control = new FormControl('');
    }

    const ctx = new ComponentContext(OuterComponent);
    ctx.assignInputs({ showInner: true });
    ctx.run(async () => {
      const outer = ctx.getComponentInstance();

      synchronizationHappened = false;
      ctx.assignInputs({ showInner: false });
      outer.control.setErrors({ newError: true });
      expect(synchronizationHappened).toBe(false);
    });
  });
});
