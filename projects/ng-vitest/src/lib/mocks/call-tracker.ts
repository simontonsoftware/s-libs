import { isDefined } from '@s-libs/js-core';
import { isEqual, isUndefined, remove } from '@s-libs/micro-dash';
import { Func } from '../interfaces';
import { TestCall } from './test-call';

type FType<T extends TestCall<Func>> = T extends TestCall<infer F> ? F : never;
export type CallMatcher<T extends TestCall<Func>> =
  | Parameters<FType<T>>
  | ((call: T) => boolean);

export abstract class CallTracker<T extends TestCall<Func>> {
  #calls: T[] = [];
  #sync: () => void;

  constructor(sync: (track: (call: T) => void) => void) {
    this.#sync = sync.bind(this, (call) => {
      this.#calls.push(call);
    });
    this.#sync();
  }

  /**
   * Expect that a single call was made that matches the given condition, and return its {@link TestCall}.
   *
   * If no such call was made, or more than one such call was made, fail with an error message including the given request description, if any.
   */
  expectOne(matcher: CallMatcher<T>, description?: string): T {
    const matches = this.match(matcher);
    if (matches.length !== 1) {
      const userInput = stringifyUserInput(matcher, description);
      throw new Error(buildErrorMessage('one matching', matches, userInput));
    }
    return matches[0];
  }

  /**
   * Expect that no requests were made that match the given condition.
   *
   * If a matching call was made, fail with an error message including the given request description, if any.
   */
  expectNone(matcher: CallMatcher<T>, description?: string): void {
    const matches = this.match(matcher);
    if (matches.length > 0) {
      const userInput = stringifyUserInput(matcher, description);
      throw new Error(buildErrorMessage('zero matching', matches, userInput));
    }
  }

  /**
   * Search for calls that match the given condition, without any expectations.
   */
  match(matcher: CallMatcher<T>): T[] {
    this.#sync();
    let filterFn: (call: T) => boolean;
    if (Array.isArray(matcher)) {
      filterFn = (call): boolean => isEqual(call.getArgs(), matcher);
    } else {
      filterFn = matcher;
    }
    return remove(this.#calls, filterFn);
  }

  /**
   * Verify that no unmatched calls are outstanding.
   *
   * If any calls are outstanding, fail with an error message indicating which calls were not handled.
   */
  verify(): void {
    this.#sync();
    if (this.#calls.length) {
      let message = buildErrorMessage('no open', this.#calls);
      message += ':';
      for (const call of this.#calls) {
        message += `\n  ${stringifyArgs(call.getArgs())}`;
      }
      throw new Error(message);
    }
  }
}

function buildErrorMessage(
  matchType: string,
  matches: unknown[],
  stringifiedUserInput?: string,
): string {
  let message = `Expected ${matchType} call(s)`;
  if (isDefined(stringifiedUserInput)) {
    message += ` for criterion "${stringifiedUserInput}"`;
  }
  message += `, found ${matches.length}`;
  return message;
}

function stringifyUserInput(
  matcher: CallMatcher<any>,
  description?: string,
): string {
  if (isUndefined(description)) {
    if (Array.isArray(matcher)) {
      description = `Match by arguments: ${stringifyArgs(matcher)}`;
    } else {
      description = `Match by function: ${matcher.name}`;
    }
  }
  return description;
}

function stringifyArgs(args: any[]): string {
  return JSON.stringify(args);
}
