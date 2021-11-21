import { isDefined } from '@s-libs/js-core';
import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { of, Subject, throwError } from 'rxjs';
import {
  mixInSubscriptionManager,
  SubscriptionManager,
} from './subscription-manager';

describe('SubscriptionManager', () => {
  let next: jasmine.Spy;
  let error: jasmine.Spy;
  let complete: jasmine.Spy;
  let manager: SubscriptionManager;

  beforeEach(() => {
    next = jasmine.createSpy();
    error = jasmine.createSpy();
    complete = jasmine.createSpy();
    manager = new SubscriptionManager();
  });

  function runSequence(sequence: any[], errorText?: string): void {
    resetSpies();

    const subject = new Subject();
    manager.subscribeTo(subject, next, error, complete);
    for (const num of sequence) {
      subject.next(num);
    }
    if (isDefined(errorText)) {
      subject.error(errorText);
    } else {
      subject.complete();
    }
  }

  function resetSpies(): void {
    next.calls.reset();
    error.calls.reset();
    complete.calls.reset();
  }

  describe('.subscribeTo()', () => {
    it('works with an observable that completes', () => {
      runSequence([1, 6]);

      expect(next).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(6);

      expect(error).not.toHaveBeenCalled();

      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('works with an observable that errors', () => {
      runSequence([1, 6], 'an error');

      expect(next).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(6);

      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('an error');

      expect(complete).not.toHaveBeenCalled();
    });

    it('binds callbacks to `this`', () => {
      runSequence([1]);
      expect(next.calls.mostRecent().object).toBe(manager);
      expect(complete.calls.mostRecent().object).toBe(manager);

      runSequence([], 'errrr');
      expect(error.calls.mostRecent().object).toBe(manager);
    });

    it('makes all callbacks optional', () => {
      manager.subscribeTo(of('this just shows there is no typing error'));

      resetSpies();
      manager.subscribeTo(of('emit this'), next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('emit this');

      resetSpies();
      manager.subscribeTo(of('emit this'), undefined, undefined, complete);
      expect(complete).toHaveBeenCalledTimes(1);

      resetSpies();
      manager.subscribeTo(throwError('throw this'), undefined, error);
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('throw this');
    });
  });

  describe('.manage()', () => {
    it('causes the manager to manage the passed-in subscription', () => {
      const subject = new Subject<void>();
      manager.manage(subject.subscribe(next));

      manager.unsubscribe();
      subject.next();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('.unsubscribe()', () => {
    it('stop callbacks', () => {
      const subject1 = new Subject();
      const subject2 = new Subject();
      manager.subscribeTo(subject1, next, error, complete);
      manager.subscribeTo(subject2, next, error, complete);

      subject1.next(1);
      subject2.next(2);
      manager.unsubscribe();
      subject1.next(-1);
      subject2.next(-2);
      subject1.complete();
      subject2.error('unseen');

      expect(next).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(2);
      expect(error).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
    });

    it('does not prevent future subscriptions', () => {
      const subject1 = new Subject();
      manager.subscribeTo(subject1, next, error, complete);
      subject1.next(1);
      manager.unsubscribe();
      subject1.next(-1);

      const subject2 = new Subject();
      manager.subscribeTo(subject2, next, error, complete);
      subject2.next(2);
      manager.unsubscribe();
      subject2.next(-2);

      expect(next).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(2);
      expect(error).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
    });
  });
});

describe('mixInSubscriptionManager()', () => {
  it('add SubscriptionManager abilities to a subclass', () => {
    class DateManager extends mixInSubscriptionManager(Date) {}
    const spy = jasmine.createSpy();
    const subject = new Subject();
    const dateManager = new DateManager();

    dateManager.subscribeTo(subject, spy);
    subject.next('value');

    expectSingleCallAndReset(spy, 'value');
  });

  it('retains the abilities of the other superclass', () => {
    class DateManager extends mixInSubscriptionManager(Date) {}

    const dateManager = new DateManager('2020-11-27');

    expect(dateManager.getFullYear()).toBe(2020);
  });
});
