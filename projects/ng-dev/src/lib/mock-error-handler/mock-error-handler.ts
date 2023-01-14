import { ErrorHandler, Injectable, Provider } from '@angular/core';
import { isRegExp, isString, isUndefined, remove } from '@s-libs/micro-dash';
import { buildErrorMessage } from '../utils';

type ErrorType = Parameters<ErrorHandler['handleError']>[0];
type Match = RegExp | string | ((error: ErrorType) => boolean);

/**
 * An error handler to be used in tests, that keeps track of all errors it handles and allows for expectations to run on them.
 *
 * ```ts
 * it('tracks errors', () => {
 *   const ctx = new AngularContext();
 *   ctx.run(() => {
 *     // test something that is supposed to throw an error
 *     ctx.inject(ErrorHandler).handleError(new Error('special message'));
 *
 *     // expect that it did
 *     ctx.inject(MockErrorHandler).expectOne('special message');
 *   });
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MockErrorHandler extends ErrorHandler {
  #errors: ErrorType[] = [];

  /**
   * Convenience method to put in a `provide` array, to override Angular's default error handler. You do not need to use this if you are using {@linkcode AngularContext}, which automatically provides it.
   *
   * ```ts
   * TestBed.configureTestingModule({
   *   providers: [MockErrorHandler.overrideProvider()],
   * });
   * ```
   */
  static overrideProvider(): Provider {
    return { provide: ErrorHandler, useExisting: MockErrorHandler };
  }

  /**
   * In addition to tracking the error, this call's Angular's [ErrorHandler.handleError]{@linkcode https://angular.io/api/core/ErrorHandler#handleError}, prints the error to the console and may print additional information that could be helpful for finding the source of the error.
   */
  override handleError(error: ErrorType): void {
    super.handleError(error);
    this.#errors.push(error);
  }

  /**
   * Expect that a single error was handled that matches the given message or predicate, and return it. If no such error was handled, or more than one, fail with a message including `description`, if provided.
   */
  expectOne(match: Match, description?: string): ErrorType {
    const matches = this.match(match);
    if (matches.length !== 1) {
      throw new Error(
        buildErrorMessage({
          matchType: 'one matching',
          itemType: 'error',
          matches,
          stringifiedUserInput: stringifyUserInput(match, description),
        }),
      );
    }
    return matches[0];
  }

  /**
   * Expect that no errors were handled which match the given message or predicate. If a matching error was handled, fail with a message including `description`, if provided.
   */
  expectNone(match: Match, description?: string): void {
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(
        buildErrorMessage({
          matchType: 'zero matching',
          itemType: 'error',
          matches,
          stringifiedUserInput: stringifyUserInput(match, description),
        }),
      );
    }
  }

  /**
   * Search for errors that match the given message or predicate, without any expectations.
   */
  match(match: Match): ErrorType[] {
    if (isString(match)) {
      const message = match;
      match = (error): boolean => error?.message === message;
    } else if (isRegExp(match)) {
      const regex = match;
      match = (error): boolean => regex.test(error?.message);
    }
    return remove(this.#errors, match);
  }

  /**
   * Verify that no unmatched errors are outstanding. If any are, fail with a message indicating which calls were not matched.
   */
  verify(): void {
    const count = this.#errors.length;
    if (count > 0) {
      throw new Error(`Expected no error(s), found ${count}`);
    }
  }
}

function stringifyUserInput(match: Match, description?: string): string {
  if (isUndefined(description)) {
    if (isString(match)) {
      description = `Match by string: ${match}`;
    } else if (isRegExp(match)) {
      description = `Match by regexp: ${match}`;
    } else {
      description = `Match by function: ${match.name}`;
    }
  }
  return description;
}
