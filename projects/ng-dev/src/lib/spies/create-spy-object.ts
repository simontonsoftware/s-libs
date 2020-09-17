import { Type } from '@angular/core';
import { functions } from '../../to-replace/functions';

// adapted from https://github.com/ngneat/spectator/blob/e13c9554778bdb179dfc7235aedb4b3b90302850/projects/spectator/src/lib/mock.ts

/**
 * Creates a new object with jasmine spies for each method in `type`.
 *
 * ```ts
 * class Greeter {
 *   greet(name: string) {
 *     return `Hello, ${name}!`;
 *   }
 * }
 *
 * const spyObject = createSpyObject(Greeter);
 * spyObject.greet.and.returnValue("Hello, stub!");
 * expect(spyObject.greet("Eric")).toBe("Hello, stub!");
 * expectSingleCallAndReset(spyObject.greet, "Eric");
 * ```
 */
export function createSpyObject<T>(type: Type<T>): jasmine.SpyObj<T> {
  const mock: any = {};
  for (
    let proto = type.prototype;
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const key of functions(proto)) {
      mock[key] = jasmine.createSpy(key);
    }
  }
  return mock;
}
