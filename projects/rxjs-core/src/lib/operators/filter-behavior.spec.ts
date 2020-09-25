import { BehaviorSubject, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  subscribeWithStubs,
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { filterBehavior } from './filter-behavior';

describe('filterBehavior()', () => {
  it('filters items based on the supplied predicate', () => {
    const source = new Subject();
    const predicate = jasmine.createSpy();
    const sub = subscribeWithStubs(source.pipe(filterBehavior(predicate)));

    source.next(1);
    sub.expectReceivedOnlyValue(1);

    predicate.and.returnValue(true);
    source.next(2);
    sub.expectReceivedOnlyValue(2);
    source.next(3);
    sub.expectReceivedOnlyValue(3);

    predicate.and.returnValue(false);
    source.next(4);
    source.next(5);
    sub.expectNoCalls();

    predicate.and.returnValue(true);
    source.next(6);
    sub.expectReceivedOnlyValue(6);
  });

  it('emits the first value unconditionally for each subscriber', () => {
    const source = new Subject();
    const predicate = jasmine.createSpy().and.returnValue(false);
    const filtered$ = source.pipe(filterBehavior(predicate));

    const sub1 = subscribeWithStubs(filtered$);
    source.next(1);
    source.next(2);
    source.next(3);

    const sub2 = subscribeWithStubs(filtered$);
    source.next(4);
    source.next(5);
    source.next(6);

    const sub3 = subscribeWithStubs(filtered$);
    source.next(7);
    source.next(8);
    source.next(9);

    sub1.expectReceivedOnlyValue(1);
    sub2.expectReceivedOnlyValue(4);
    sub3.expectReceivedOnlyValue(7);
  });

  it('handles the predicate throwing an error', () => {
    const ex = new Error();
    const thrower = () => {
      throw ex;
    };
    const source = new Subject();
    const sub1 = subscribeWithStubs(source.pipe(filterBehavior(thrower)));
    const sub2 = subscribeWithStubs(source.pipe(filterBehavior(thrower)));
    const sub3 = subscribeWithStubs(
      source.pipe(
        filterBehavior(thrower),
        catchError(() => new BehaviorSubject(-1)),
      ),
    );

    expect(source.observers.length).toBe(3);
    sub1.expectNoCalls();
    sub2.expectNoCalls();
    sub3.expectNoCalls();

    source.next(1);
    sub1.expectReceivedOnlyValue(1);
    sub2.expectReceivedOnlyValue(1);
    sub3.expectReceivedOnlyValue(1);

    source.next(2);
    expect(source.observers.length).toBe(0);
    sub1.expectReceivedOnlyError(ex);
    sub2.expectReceivedOnlyError(ex);
    sub3.expectReceivedOnlyValue(-1);
  });

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() => filterBehavior(() => true)),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => filterBehavior(() => true)),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => filterBehavior(() => true)),
  );
});
