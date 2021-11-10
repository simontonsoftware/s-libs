import { ErrorHandler, Injectable, Provider } from '@angular/core';
import { isRegExp, isString, remove } from '@s-libs/micro-dash';
import { buildErrorMessage } from './utils';

type ErrorType = Parameters<ErrorHandler['handleError']>[0];
type Match = string | RegExp | ((error: ErrorType) => boolean);

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
  /**
   * Convenience method to put in a `provide` array, to override Angular's default error handler. Note that this is provided automatically by {@linkcode AngularContext}.
   *
   * ```ts
   * TestBed.configureTestingModule({
   *   providers: [MockErrorHandler.createProvider()],
   * });
   * ```
   */
  static createProvider(): Provider {
    return { provide: ErrorHandler, useExisting: MockErrorHandler };
  }

  #errors: ErrorType[] = [];

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
      match = (error) => error?.message === message;
    } else if (isRegExp(match)) {
      const regex = match;
      match = (error) => regex.test(error?.message);
    }
    return remove(this.#errors, match);
  }

  /**
   * Verify that no unmatched errors are outstanding. If any are, fail with a message indicating which calls were not matched.
   */
  verify() {
    const count = this.#errors.length;
    if (count > 0) {
      throw new Error(`Expected no error(s), found ${count}`);
    }
  }
}

function stringifyUserInput(match: Match, description?: string): string {
  if (!description) {
    if (isString(match)) {
      description = 'Match by string: ' + match;
    } else if (isRegExp(match)) {
      description = 'Match by regexp: ' + match;
    } else {
      description = 'Match by function: ' + match.name;
    }
  }
  return description;
}
