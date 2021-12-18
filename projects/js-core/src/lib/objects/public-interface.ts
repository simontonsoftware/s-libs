// from https://github.com/microsoft/TypeScript/issues/16556#issuecomment-308831129

/**
 * Extracts only the public members of an interface. This is useful when implementing a class, e.g. when creating a mock of it for tests, so that you do not need to recreate the private and protected members.
 *
 * ```ts
 * class Service {
 *   protected semiSecretState = 1;
 *   private secretState = 2;
 *   doStuff(): void {
 *     console.log(this.secretState, this.semiSecretState);
 *   }
 * }
 *
 * class MockService implements PublicInterface<Service> {
 *   doStuffWasCalled = false;
 *   doStuff(): void {
 *     this.doStuffWasCalled = true;
 *   }
 * }
 * ```
 */
export type PublicInterface<T> = { [K in keyof T]: T[K] };
