import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { Deferred } from '@s-libs/js-core';
import {
  AngularContext,
  expectRequest,
  expectSingleCallAndReset,
} from '@s-libs/ng-dev';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { debounceMap } from './debounce-map';

describe('debounceMap()', () => {
  it('emits the mapped values', fakeAsync(() => {
    const next = jasmine.createSpy();
    of(3)
      .pipe(debounceMap(async (i) => i ** 2))
      .subscribe(next);
    tick();
    expectSingleCallAndReset(next, 9);
  }));

  it('debounces with observables', fakeAsync(() => {
    const subject = new Subject();
    const map = jasmine.createSpy().and.returnValue(subject);
    const source = new Subject();
    source.pipe(debounceMap(map)).subscribe();

    source.next(0);
    tick();
    source.next(1);
    tick();
    source.next(2);
    tick();
    expectSingleCallAndReset(map, 0);

    subject.complete();
    tick();
    expectSingleCallAndReset(map, 2);
  }));

  it('debounces with promises', fakeAsync(() => {
    const deferred = new Deferred();
    const map = jasmine.createSpy().and.returnValue(deferred.promise);
    const source = new Subject();
    source.pipe(debounceMap(map)).subscribe();

    source.next(0);
    tick();
    source.next(1);
    tick();
    source.next(2);
    tick();
    expectSingleCallAndReset(map, 0);

    deferred.resolve(0);
    tick();
    expectSingleCallAndReset(map, 2);
  }));

  it('lets emissions directly through when the previous one already completed', fakeAsync(() => {
    const source = new Subject();
    const next = jasmine.createSpy();
    source.pipe(debounceMap(async () => 0)).subscribe(next);

    source.next(0);
    tick();
    expectSingleCallAndReset(next, 0);

    source.next(1);
    tick();
    expectSingleCallAndReset(next, 0);
  }));

  it('emits and debounces as long as the previous observable is going', fakeAsync(() => {
    const source = new Subject<number>();
    const subjects = [new Subject(), new Subject()];
    const next = jasmine.createSpy();
    source.pipe(debounceMap((i) => subjects[i])).subscribe(next);

    source.next(0);
    tick();
    source.next(1);
    tick();

    subjects[0].next('hi');
    expectSingleCallAndReset(next, 'hi');

    // emit twice to ensure the first didn't let the debounce through
    subjects[0].next('there');
    expectSingleCallAndReset(next, 'there');
  }));

  it('subscribes exactly once to map results', () => {
    const ctx = new AngularContext({ providers: [provideHttpClient()] });
    ctx.run(() => {
      const source = new Subject();
      source
        .pipe(debounceMap(() => ctx.inject(HttpClient).get('a url')))
        .subscribe();

      source.next(0);
      ctx.tick();
      expectRequest('GET', 'a url');

      // the debounce operation should not initiate a new subscribe
      source.next(1);
      ctx.tick();
      ctx.inject(HttpTestingController).verify();
    });
  });

  it('calls map asynchronously even when nothing is pending (for consistency)', fakeAsync(() => {
    const map = jasmine.createSpy().and.resolveTo(1);
    new BehaviorSubject(0).pipe(debounceMap(map)).subscribe();

    expect(map).not.toHaveBeenCalled();
    tick();
    expectSingleCallAndReset(map, 0);
  }));

  it('passes along unsubscribes to a pending observable', fakeAsync(() => {
    const pending = new Subject();
    const subscription = new BehaviorSubject(0)
      .pipe(debounceMap(() => pending))
      .subscribe();
    tick();
    expect(pending.observed).toBe(true); // sanity check

    subscription.unsubscribe();

    expect(pending.observed).toBe(false);
  }));

  it('completes only after both the source and mapped observable', fakeAsync(() => {
    const source = new Subject<number>();
    const subjects = [new Subject(), new Subject()];
    const complete = jasmine.createSpy();
    source.pipe(debounceMap((i) => subjects[i])).subscribe({ complete });

    // does not complete with only the mapped
    source.next(0);
    tick();
    subjects[0].complete();
    expect(complete).not.toHaveBeenCalled();

    // does not complete after only the source
    source.next(1);
    tick();
    source.complete();
    expect(complete).not.toHaveBeenCalled();

    // completes after both
    subjects[1].complete();
    expectSingleCallAndReset(complete);
  }));

  it(
    'passes along unsubscribes to the source observable',
    testUnsubscribePropagation(() => debounceMap(Promise.resolve)),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => debounceMap(Promise.resolve)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => debounceMap(Promise.resolve)),
  );
});
