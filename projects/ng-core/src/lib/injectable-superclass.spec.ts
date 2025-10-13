import { Component, Directive, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ComponentContext, expectSingleCallAndReset } from '@s-libs/ng-dev';
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
  template: `@if (showThings) {
    <p slDestroyableDirective>I'm showing.</p>
  }`,
})
class TestComponent {
  showThings = true;
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

  it('cleans up subscriptions when destroyed by angular', () => {
    ctx.run(() => {
      expect(ctx.subject.observed).toBeTrue();

      ctx.getComponentInstance().showThings = false;
      ctx.fixture.detectChanges();
      expect(ctx.subject.observed).toBeFalse();
    });
  });

  it('has .destruction$ which emits and completes upon destruction', () => {
    const next = jasmine.createSpy();
    const complete = jasmine.createSpy();
    ctx.run(() => {
      const host = ctx.fixture.debugElement.query(
        By.directive(DestroyableDirective),
      );
      const service = host.injector.get(DestroyableService);
      service.destruction$.subscribe({ next, complete });

      ctx.getComponentInstance().showThings = false;
      ctx.fixture.detectChanges();
      expectSingleCallAndReset(next, undefined);
      expectSingleCallAndReset(complete);
    });
  });
});

describe('mixInInjectableSuperclass()', () => {
  it('add InjectableSuperclass abilities to a subclass', () => {
    TestBed.runInInjectionContext(() => {
      class InjectableDate extends mixInInjectableSuperclass(Date) {}
      const spy = jasmine.createSpy();
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
