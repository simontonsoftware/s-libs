import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { expectSingleCallAndReset } from '../public-api';
import { logTimers } from './log-timers';

describe('logTimers()', () => {
  it('prints each timeout call to `console.log`', fakeAsync(() => {
    const logSpy = spyOn(console, 'log');
    const stopLogging = logTimers();

    setTimeout(myFunction);
    expectSingleCallAndReset(logSpy, 'setTimeout(', myFunction, ')');

    setTimeout(myDelayedFunction, 1000);
    expectSingleCallAndReset(
      logSpy,
      'setTimeout(',
      myDelayedFunction,
      1000,
      ')',
    );

    tick(1000);
    stopLogging();

    function myFunction(): void {}

    function myDelayedFunction(): void {}
  }));

  it('prints each interval call to `console.log`', fakeAsync(() => {
    const logSpy = spyOn(console, 'log');
    const stopLogging = logTimers();

    setInterval(myFunction);
    expectSingleCallAndReset(logSpy, 'setInterval(', myFunction, ')');

    setInterval(myDelayedFunction, 1000);
    expectSingleCallAndReset(
      logSpy,
      'setInterval(',
      myDelayedFunction,
      1000,
      ')',
    );

    discardPeriodicTasks();
    stopLogging();

    function myFunction(): void {}

    function myDelayedFunction(): void {}
  }));

  it('returns a function to stop the logging', () => {
    const logSpy = spyOn(console, 'log');

    const stopLogging = logTimers();
    stopLogging();

    setTimeout(myFunction);
    setInterval(myFunction);
    expect(logSpy).not.toHaveBeenCalled();

    function myFunction(): void {}
  });
});
