import { Component, Directive, inject, Injectable, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { noop } from '@s-libs/micro-dash';
import { ComponentContext, expectSingleCallAndReset } from '@s-libs/ng-vitest';
import { Subject } from 'rxjs';
import {
  InjectableSuperclass,
  mixInInjectableSuperclass,
} from './injectable-superclass';

@Injectable()
class DestroyableService extends InjectableSuperclass {}

@Directive({
  selector: `[slDestroyableDirective]`,
  providers: [DestroyableService],
})
class DestroyableDirective extends InjectableSuperclass {
  constructor() {
    super();

    const subject = inject(Subject);
    this.subscribeTo(subject);
    inject(DestroyableService).subscribeTo(subject);
  }
}

@Component({
  imports: [DestroyableDirective],
  template: `@if (showThings()) {
    <p slDestroyableDirective>I'm showing.</p>
  }`,
})
class TestComponent {
  readonly showThings = input(true);
}

class TestComponentContext extends ComponentContext<TestComponent> {
  subject = new Subject();

  constructor() {
    super(TestComponent, {
      providers: [
        { provide: Subject, useFactory: (): Subject<unknown> => this.subject },
      ],
    });
  }
}

describe('InjectableSuperclass', () => {
  let ctx: TestComponentContext;
  beforeEach(async () => {
    ctx = new TestComponentContext();
  });

  it('cleans up subscriptions when destroyed by angular', async () => {
    await ctx.run(async () => {
      expect(ctx.subject.observed).toBe(true);

      await ctx.assignInputs({ showThings: false });
      expect(ctx.subject.observed).toBe(false);
    });
  });

  it('has .destruction$ which emits and completes upon destruction', async () => {
    const next = vi.fn(noop);
    const complete = vi.fn(noop);
    await ctx.run(async () => {
      const host = ctx.fixture.debugElement.query(
        By.directive(DestroyableDirective),
      );
      const service = host.injector.get(DestroyableService);
      service.destruction$.subscribe({ next, complete });

      await ctx.assignInputs({ showThings: false });
      expectSingleCallAndReset(next, undefined);
      expectSingleCallAndReset(complete);
    });
  });
});

describe('mixInInjectableSuperclass()', () => {
  it('add InjectableSuperclass abilities to a subclass', () => {
    TestBed.runInInjectionContext(() => {
      class InjectableDate extends mixInInjectableSuperclass(Date) {}
      const spy = vi.fn(noop);
      const subject = new Subject();
      const dateManager = new InjectableDate();

      dateManager.subscribeTo(subject, spy);
      subject.next('value');

      expectSingleCallAndReset(spy, 'value');
    });
  });

  it('retains the abilities of the other superclass', () => {
    TestBed.runInInjectionContext(() => {
      class InjectableDate extends mixInInjectableSuperclass(Date) {}

      const dateManager = new InjectableDate('2020-11-27');

      expect(dateManager.getFullYear()).toBe(2020);
    });
  });
});
