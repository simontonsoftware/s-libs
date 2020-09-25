import { noop } from 'micro-dash';
import { of, throwError } from 'rxjs';
import { expectCallsAndReset } from 's-ng-dev-utils';
import {
  testCompletionPropagation,
  testErrorPropagation,
  testUnsubscribePropagation,
} from '../../test-helpers/misc-helpers';
import { logValues } from './log-values';

describe('logValue()', () => {
  const consoleSpy = console as jasmine.SpyObj<Console>;

  beforeEach(() => {
    spyOnAllFunctions(console);
  });

  it('has defaults for all arguments', () => {
    of(1, 2).pipe(logValues()).subscribe();
    expectCallsAndReset(
      consoleSpy.log,
      ['[value]', 1],
      ['[value]', 2],
      ['[complete]'],
    );

    throwError('an error').pipe(logValues()).subscribe(noop, noop);
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

    throwError('an error').pipe(logValues('prefix')).subscribe(noop, noop);
    expectCallsAndReset(consoleSpy.log, ['[error]', 'prefix', 'an error']);
  });

  it('can log to different levels', () => {
    of(1).pipe(logValues(undefined, 'warn')).subscribe();
    expectCallsAndReset(consoleSpy.warn, ['[value]', 1], ['[complete]']);

    throwError('an error')
      .pipe(logValues(undefined, 'debug'))
      .subscribe(noop, noop);
    expectCallsAndReset(consoleSpy.debug, ['[error]', 'an error']);
  });

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
