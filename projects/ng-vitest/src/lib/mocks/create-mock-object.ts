import { Type } from '@angular/core';
import { functions } from '@s-libs/micro-dash';
import { Mock } from 'vitest';
import { MockController } from './mock-controller';

// adapted from https://github.com/ngneat/spectator/blob/e13c9554778bdb179dfc7235aedb4b3b90302850/projects/spectator/src/lib/mock.ts

/**
 * Return type of {@linkcode createMockObject}.
 */
export type MockObject<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? Mock<T[K]> & { controller: MockController<T[K]> }
    : never;
};

/**
 * Creates a new object with Vitest mocks for each method in `type`. Each comes with a {@linkcode MockController} you can use for targeted expectations.
 *
 * ```ts
 * class Greeter {
 *   greet(name: string): string {
 *     return `Hello, ${name}!`;
 *   }
 * }
 *
 * const mockObject = createMockObject(Greeter);
 * mockObject.greet.mockReturnValue('Hello, stub!');
 * expect(mockObject.greet('Eric')).toBe('Hello, stub!');
 * expectSingleCallAndReset(mockObject.greet, 'Eric');
 * ```
 */
export function createMockObject<T>(type: Type<T>): MockObject<T> {
  const mock: any = {};
  for (
    let proto = type.prototype;
    proto !== null;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const key of functions(proto)) {
      mock[key] = vi.fn();
      mock[key].controller = new MockController(mock[key]);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return mock;
}
