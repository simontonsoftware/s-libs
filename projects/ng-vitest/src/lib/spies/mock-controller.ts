import { isEqual, isUndefined, remove } from '@s-libs/micro-dash';
import { MockParameters } from '@vitest/spy';
import { Mock } from 'vitest';
import { buildErrorMessage } from './utils';

export type CallMatcher<F extends (...args: any[]) => any> =
  | Parameters<F>
  | ((params: MockParameters<F>) => boolean);

export class MockController<F extends (...args: any[]) => any> {
  #calls: Array<MockParameters<F>> = [];
  #syncedCount = 0;

  constructor(private mockFn: Mock<F>) {}

  expectOne(matcher: CallMatcher<F>, description?: string): MockParameters<F> {
    const matches = this.match(matcher);
    if (matches.length !== 1) {
      throw new Error(
        buildErrorMessage({
          matchType: 'one matching',
          itemType: 'call',
          matches,
          stringifiedUserInput: this.#stringifyUserInput(matcher, description),
        }),
      );
    }
    return matches[0];
  }

  expectNone(matcher: CallMatcher<F>, description?: string): void {
    const matches = this.match(matcher);
    if (matches.length > 0) {
      throw new Error(
        buildErrorMessage({
          matchType: 'zero matching',
          itemType: 'call',
          stringifiedUserInput: this.#stringifyUserInput(matcher, description),
          matches,
        }),
      );
    }
  }

  match(matcher: CallMatcher<F>): Array<MockParameters<F>> {
    this.#syncCalls();
    let filterFn: (args: MockParameters<F>) => boolean;
    if (Array.isArray(matcher)) {
      filterFn = (args) => isEqual(args, matcher);
    } else {
      filterFn = matcher;
    }
    return remove(this.#calls, filterFn);
  }

  verify(): void {
    if (this.#calls.length) {
      this.#syncCalls();
      let message = `${buildErrorMessage({
        matchType: 'no open',
        itemType: 'call',
        stringifiedUserInput: undefined,
        matches: this.#calls,
      })}:`;
      for (const call of this.#calls) {
        message += `\n  ${stringifyArgs(call)}`;
      }
      throw new Error(message);
    }
  }

  #syncCalls(): void {
    const { calls } = this.mockFn.mock;
    this.#calls.push(...calls.slice(this.#syncedCount));
    this.#syncedCount = calls.length;
  }

  #stringifyUserInput(matcher: CallMatcher<F>, description?: string): string {
    if (isUndefined(description)) {
      if (Array.isArray(matcher)) {
        description = `Match by arguments: ${stringifyArgs(matcher)}`;
      } else {
        description = `Match by function: ${matcher.name}`;
      }
    }
    return description;
  }
}

function stringifyArgs(args: any[]): string {
  return JSON.stringify(args);
}
