import { noop } from '@s-libs/micro-dash';
import { expectCallsAndReset } from '@s-libs/ng-dev';
import { of, throwError } from 'rxjs';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
  testValuePropagation,
} from '../../test-helpers/misc-helpers';
import { logValues } from './log-values';

describe('logValue()', () => {
  let consoleSpy: jasmine.SpyObj<Console>;
  beforeEach(() => {
    consoleSpy = spyOnAllFunctions(console);
  });

  it('has defaults for all arguments', () => {
    of(1, 2).pipe(logValues()).subscribe();
    expectCallsAndReset(
      consoleSpy.log,
      ['[value]', 1],
      ['[value]', 2],
      ['[complete]'],
    );

    throwError(() => 'an error')
      .pipe(logValues())
      .subscribe({ error: noop });
    expectCallsAndReset(consoleSpy.log, ['[error]', 'an error']);
  });

  it('accepts a single prefix', () => {
    of(1, 2).pipe(logValues('prefix')).subscribe();
    expectCallsAndReset(
      consoleSpy.log,
      ['[value]', 'prefix', 1],
      ['[value]', 'prefix', 2],
      ['[complete]', 'prefix'],
    );

    throwError(() => 'an error')
      .pipe(logValues('prefix'))
      .subscribe({ error: noop });
    expectCallsAndReset(consoleSpy.log, ['[error]', 'prefix', 'an error']);
  });

  it('can log to different levels', () => {
    of(1).pipe(logValues(undefined, 'warn')).subscribe();
    expectCallsAndReset(consoleSpy.warn, ['[value]', 1], ['[complete]']);

    throwError(() => 'an error')
      .pipe(logValues(undefined, 'debug'))
      .subscribe({ error: noop });
    expectCallsAndReset(consoleSpy.debug, ['[error]', 'an error']);
  });

  it(
    'passes along values',
    testValuePropagation(() => logValues()),
  );

  it(
    'passes along unsubscribes',
    testUnsubscribePropagation(() => logValues()),
  );

  it(
    'passes along errors',
    testErrorPropagation(() => logValues()),
  );

  it(
    'passes along completion',
    testCompletionPropagation(() => logValues()),
  );
});
