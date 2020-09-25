import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { expectSingleCallAndReset } from 's-ng-dev-utils';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { delayOnMicrotaskQueue } from './delay-on-microtask-queue';

describe('delayOnMicrotaskQueue()', () => {
  it('passes along values asynchronously', fakeAsync(() => {
    const source = new Subject<number>();
    const spy = jasmine.createSpy();
    source.pipe(delayOnMicrotaskQueue()).subscribe(spy);

    source.next(1);
    expect(spy).not.toHaveBeenCalled();
    flushMicrotasks();
    expectSingleCallAndReset(spy, 1);

    source.next(2);
    expect(spy).not.toHaveBeenCalled();
    flushMicrotasks();
    expectSingleCallAndReset(spy, 2);
  }));

  it(
    'passes along unsubscribes synchronously',
    testUnsubscribePropagation(delayOnMicrotaskQueue),
  );

  it(
    'passes along errors synchronously',
    testErrorPropagation(delayOnMicrotaskQueue),
  );

  it(
    'passes along completion synchronously',
    testCompletionPropagation(delayOnMicrotaskQueue),
  );
});
