import { ComponentHarness, HarnessQuery } from '@angular/cdk/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  AbstractType,
  ApplicationInitStatus,
  ApplicationRef,
  InjectionToken,
  Type,
} from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { assert, convertTime } from '@s-libs/js-core';
import { forOwn, isUndefined } from '@s-libs/micro-dash';
import { MockErrorHandler } from '@s-libs/ng-dev';
import { vi } from 'vitest';
import { FakeTimerHarnessEnvironment } from './fake-timer-harness-environment';

// overrides later it the list will take precedence
export function extendMetadata(
  ...allMetadata: TestModuleMetadata[]
): TestModuleMetadata {
  const result: any = {};
  for (const metadata of allMetadata) {
    forOwn(metadata, (val, key) => {
      const existing = result[key];
      if (isUndefined(existing)) {
        result[key] = val;
      } else {
        result[key] = [result[key], val];
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}

/**
 * Provides the foundation for an opinionated testing pattern.
 * - All tests are run with `vi.useFakeTimers`. This gives you full control over the timing of everything by default.
 * - Variables that are initialized for each test exist in a context that is thrown away, so they cannot leak between tests.
 * - Clearly separates initialization code from the test itself.
 * - Gives control over the simulated date and time with a single line of code.
 * - Automatically includes {@link https://angular.dev/api/common/http/testing/provideHttpClientTesting | provideHttpClientTesting()} to stub network requests without additional setup.
 * - Always verifies that no unexpected http requests were made.
 * - Always verifies that no unmatched errors were thrown (using {@link MockErrorHandler}).
 * - Disables Material animations so that you don't need to wait for them in your tests.
 *
 * This example tests a simple service that uses `HttpClient` and is tested by using `AngularContext` directly. More often, `AngularContext` will be used as a super class. See {@link ComponentContext} for more common use cases.
 *
 * ```ts
 * // This is the class we will test.
 * @Injectable({ providedIn: 'root' })
 * class MemoriesService {
 *   #httpClient = inject(HttpClient);
 *
 *   getLastYearToday(): Observable<any> {
 *     const datetime = new Date();
 *     datetime.setFullYear(datetime.getFullYear() - 1);
 *     const date = datetime.toISOString().split('T')[0];
 *     return this.#httpClient.get(`http://example.com/post-from/${date}`);
 *   }
 * }
 *
 * describe('MemoriesService', () => {
 *   // Tests should have exactly 1 variable outside an "it": `ctx`.
 *   let ctx: AngularContext;
 *   beforeEach(() => {
 *     ctx = new AngularContext({ providers: [provideHttpClient()] });
 *   });
 *
 *   it('requests a post from 1 year ago', async () => {
 *     // Before calling `run`, set up any context variables this test needs.
 *     ctx.startTime = new Date('2004-02-16T10:15:00.000Z');
 *
 *     // Pass the test itself as a callback to `run()`.
 *     await ctx.run(() => {
 *       const httpBackend = ctx.inject(HttpTestingController);
 *       const myService = ctx.inject(MemoriesService);
 *
 *       myService.getLastYearToday().subscribe();
 *
 *       httpBackend.expectOne('http://example.com/post-from/2003-02-16');
 *     });
 *   });
 * });
 * ```
 */
export class AngularContext {
  static #current?: AngularContext;

  /**
   * Set this before calling `run()` to mock the time at which the test starts.
   */
  startTime = new Date();

  #isRunning = false;
  #loader = FakeTimerHarnessEnvironment.documentRootLoader(this);

  /**
   * @param moduleMetadata passed along to {@linkcode https://angular.dev/api/core/testing/TestBedStatic#configureTestingModule | TestBed.configureTestingModule()}. Automatically includes {@link provideHttpClientTesting}, {@link MockErrorHandler}, and {@link MATERIAL_ANIMATIONS} with `animationsDisabled: true`.
   */
  constructor(moduleMetadata: TestModuleMetadata = {}) {
    assert(
      !AngularContext.#current,
      'There is already another AngularContext in use (or it was not cleaned up)',
    );
    AngularContext.#current = this;
    TestBed.configureTestingModule(
      extendMetadata(
        {
          providers: [
            MockErrorHandler.overrideProvider(),
            {
              provide: MATERIAL_ANIMATIONS,
              useValue: { animationsDisabled: true },
            },
          ],
        },
        moduleMetadata,
        { providers: [provideHttpClientTesting()] },
      ),
    );
  }

  /**
   * Returns the current `AngularContext` that is in use, or `undefined` if there is not one. A context is defined to be "in use" from the time it is constructed until after its `run()` method completes.
   */
  static getCurrent(): AngularContext | undefined {
    return AngularContext.#current;
  }

  /**
   * Runs `test` with fake timers enabled. It can use async/await, but be sure anything you `await` is already due to execute (e.g. if a timeout is due in 3 seconds, call `.tick(3000)` before `await`ing its result).
   *
   * Also runs the following in this order:
   *
   * 1. `this.init()`
   * 2. `test()`
   * 3. `this.verifyPostTestConditions()`
   * 4. `this.cleanUp()`
   */
  async run(test: () => Promise<void> | void): Promise<void> {
    this.#isRunning = true;
    vi.useFakeTimers();
    vi.setSystemTime(this.startTime);
    try {
      await this.init();
      await test();
      this.verifyPostTestConditions();
    } finally {
      try {
        await this.cleanUp();
      } finally {
        vi.useRealTimers();
        AngularContext.#current = undefined;
        this.#isRunning = false;
      }
    }
  }

  /**
   * Returns whether this context is currently executing the {@linkcode #run} callback.
   */
  isRunning(): boolean {
    return this.#isRunning;
  }

  /**
   * Gets a service or other injectable from the root injector.
   *
   * This implementation is a simple pass-through to {@linkcode https://angular.dev/api/core/testing/TestBedStatic#inject | TestBed.inject()}, but subclasses may provide their own implementation. It is recommended to use this in your tests instead of using `TestBed` directly.
   */
  inject<T>(token: AbstractType<T> | InjectionToken<T> | Type<T>): T {
    return TestBed.inject(token);
  }

  /**
   * Returns whether any components match the given `query`.
   */
  async hasHarness<H extends ComponentHarness>(
    query: HarnessQuery<H>,
  ): Promise<boolean> {
    return this.#loader.hasHarness(query);
  }

  /**
   * Gets a component harness. Throws an error if no matching component is found.
   */
  async getHarness<H extends ComponentHarness>(
    query: HarnessQuery<H>,
  ): Promise<H> {
    return this.#loader.getHarness(query);
  }

  /**
   * Gets a component harness. Returns `null` if no matching component is found.
   */
  async getHarnessOrNull<H extends ComponentHarness>(
    query: HarnessQuery<H>,
  ): Promise<H | null> {
    return this.#loader.getHarnessOrNull(query);
  }

  /**
   * Gets all component harnesses that match the query.
   */
  async getAllHarnesses<H extends ComponentHarness>(
    query: HarnessQuery<H>,
  ): Promise<H[]> {
    return this.#loader.getAllHarnesses(query);
  }

  /**
   * Advance time and trigger change detection. It is common to call this with no arguments to trigger change detection without advancing time.
   *
   * @param unit The unit of time `amount` represents. Accepts anything described in `@s-libs/s-core`'s [TimeUnit]{@linkcode https://simontonsoftware.github.io/s-js-utils/typedoc/enums/timeunit.html} enum.
   */
  async tick(amount = 0, unit = 'ms'): Promise<void> {
    if (!this.#isRunning) {
      throw new Error(
        `.tick() only works inside the .run() callback (because it needs Vitest's fake timers)`,
      );
    }

    await vi.advanceTimersByTimeAsync(convertTime(amount, unit, 'ms'));
    this.runChangeDetection();
    await vi.advanceTimersByTimeAsync(0);
  }

  /**
   * This is a hook for subclasses to override. It is called during `run()`, before the `test()` callback. This implementation does nothing, but if you override this it is still recommended to call `super.init()` in case this implementation does something in the future.
   */
  protected async init(): Promise<void> {
    await this.inject(ApplicationInitStatus).donePromise;
  }

  protected runChangeDetection(): void {
    this.inject(ApplicationRef).tick();
  }

  /**
   * Runs post-test verifications. This base implementation runs {@linkcode https://angular.dev/api/common/http/testing/HttpTestingController#verify | HttpTestingController.verify} and {@linkcode MockErrorHandler.verify}. It is OK for this method to throw an error to indicate a violation.
   */
  protected verifyPostTestConditions(): void {
    this.inject(HttpTestingController).verify();
    this.inject(MockErrorHandler).verify();
  }

  /**
   * This is a hook for subclasses to override. It is called as the last step during `run()`, even if a previous step errored. This implementation does nothing, but if you override this it is still recommended to call `super.cleanUp()` in case this implementation does something in the future.
   */
  protected async cleanUp(): Promise<void> {}
}
