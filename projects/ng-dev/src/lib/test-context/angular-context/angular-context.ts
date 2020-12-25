import { ComponentHarness, HarnessQuery } from '@angular/cdk/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  AbstractType,
  ApplicationRef,
  InjectionToken,
  Type,
} from '@angular/core';
import {
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { assert, convertTime } from '@s-libs/js-core';
import { clone, forOwn, isFunction } from '@s-libs/micro-dash';
import { FakeAsyncHarnessEnvironment } from './fake-async-harness-environment';
import { Synchronized } from '../synchronize';

/** @hidden */
export function extendMetadata(
  metadata: TestModuleMetadata,
  toAdd: TestModuleMetadata,
): TestModuleMetadata {
  const result: any = clone(metadata);
  forOwn(toAdd, (val, key) => {
    result[key] = Array.isArray(result[key]) ? result[key].concat(val) : val;
  });
  return result;
}

/**
 * Provides the foundation for an opinionated testing pattern.
 * - All test are run in the `fakeAsync` zone. This gives you full control over
 *   the timing of everything by default.
 * - Variables that are initialized for each test exist in a context that is
 *   thrown away, so they cannot leak between tests.
 * - Clearly separates initialization code from the test itself.
 * - Gives control over the simulated date & time with a single line of code.
 * - Automatically includes {@link HttpClientTestingModule} to stub network requests without additional setup.
 * - Always verifies no unexpected http requests were made during a test.
 * - Always discards periodic tasks at the end of each test to automatically
 *   avoid an error from the `fakeAsync` zone.
 *
 * This example tests a simple service that uses HttpClient, and is tested by
 * using `AngularContext` directly. More often `AngularContext` will be used a
 * super class. See {@link ComponentContextNext} for more common use cases.
 * ```ts
 *  // This is the class we will test.
 *  @Injectable({ providedIn: 'root' })
 *  class MemoriesService {
 *   constructor(private httpClient: HttpClient) {}
 *
 *   getLastYearToday(): Observable<any> {
 *     const datetime = new Date();
 *     datetime.setFullYear(datetime.getFullYear() - 1);
 *     const date = datetime.toISOString().split('T')[0];
 *     return this.httpClient.get(`http://example.com/post-from/${date}`);
 *   }
 * }
 *
 *  describe('MemoriesService', () => {
 *
 *   // Tests should have exactly 1 variable outside an "it": `ctx`.
 *   let ctx: AngularContext;
 *   beforeEach(() => {
 *     ctx = new AngularContext();
 *   });
 *
 *   it('requests a post from 1 year ago', () => {
 *
 *     // Before calling `run`, set up any context variables this test needs.
 *     ctx.startTime = new Date('2004-02-16T10:15:00.000Z');
 *
 *     // Pass the test itself as a callback to `run()`.
 *     ctx.run(() => {
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
export class AngularContext<InitOptions = {}> {
  /**
   * Set this before calling `run()` to mock the time at which the test starts.
   */
  startTime = new Date();

  private loader = FakeAsyncHarnessEnvironment.documentRootLoader(this);

  /**
   * @param moduleMetadata passed along to [TestBed.configureTestingModule()]{@linkcode https://angular.io/api/core/testing/TestBed#configureTestingModule}. Automatically includes {@link HttpClientTestingModule} for you.
   */
  constructor(moduleMetadata: TestModuleMetadata = {}) {
    TestBed.configureTestingModule(
      extendMetadata(moduleMetadata, { imports: [HttpClientTestingModule] }),
    );
  }

  /**
   * Runs `test` in a `fakeAsync` zone. Also runs the following in this order, all within the same zone:
   * 1. `init(options)`
   * 2. `test()`
   * 3. `verifyPostTestConditions()`
   * 4. `cleanUp()`
   *
   * @param options Passed along to `init()`. Unused by `AngularContext`, but may be used by subclasses.
   */
  run(test: () => void): void;
  run(options: Partial<InitOptions>, test: () => void): void;
  run(
    optionsOrTest: Partial<InitOptions> | (() => void),
    test?: () => void,
  ): void {
    let options: Partial<InitOptions> = {};
    if (isFunction(optionsOrTest)) {
      test = optionsOrTest;
    } else {
      options = optionsOrTest;
    }

    this.runWithMockedTime(() => {
      assert(test);

      this.init(options);
      try {
        test();
        this.verifyPostTestConditions();
      } finally {
        this.cleanUp();
      }
    });
  }

  /**
   * Gets a service or other injectable from the root injector. This implementation is a simple pass-through to [TestBed.inject()]{@linkcode https://angular.io/api/core/testing/TestBed#inject}, but subclasses may provide their own implementation. It is recommended to use this in your tests instead of using `TestBed` directly.
   */
  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>): T {
    return TestBed.inject(token);
  }

  /**
   * Gets a component harness, wrapped for use in a fakeAsync test so that you do not need to `await` its results. Throws an error if no match can be located.
   */
  getHarness<T extends ComponentHarness>(
    query: HarnessQuery<T>,
  ): Synchronized<T> {
    return this.loader.getHarness(query) as Synchronized<T>;
  }

  /**
   * Gets a component harness, wrapped for use in a fakeAsync test so that you do not need to `await` its results. Returns `null` if the harness cannot be located.
   */
  getHarnessForOptional<T extends ComponentHarness>(
    query: HarnessQuery<T>,
  ): Synchronized<T> | null {
    return this.loader.locatorForOptional(query)() as Synchronized<T> | null;
  }

  /**
   * Gets all component harnesses that match the query, wrapped for use in a fakeAsync test so that you do not need to `await` its results.
   */
  getAllHarnesses<T extends ComponentHarness>(
    query: HarnessQuery<T>,
  ): Array<Synchronized<T>> {
    return (this.loader.getAllHarnesses(query) as unknown) as Array<
      Synchronized<T>
    >;
  }

  /**
   * Advance time and trigger change detection. It is common to call this with no arguments to trigger change detection without advancing time.
   *
   * @param unit The unit of time `amount` represents. Accepts anything described in `@s-libs/s-core`'s [TimeUnit]{@linkcode https://simontonsoftware.github.io/s-js-utils/typedoc/enums/timeunit.html} enum.
   */
  tick(amount = 0, unit = 'ms'): void {
    // To simulate real life, trigger change detection before processing macro tasks. To further simulate real life, wait until the micro task queue is empty.
    flushMicrotasks();
    this.runChangeDetection();

    tick(convertTime(amount, unit, 'ms'));
    this.runChangeDetection();
  }

  /**
   * This is a hook for subclasses to override. It is called during `run()`, before the `test()` callback. This implementation does nothing, but if you override this it is still recommended to call `super.init(options)` in case this implementation does something in the future.
   */
  protected init(_options: Partial<InitOptions>): void {}

  /** @hidden */
  protected runChangeDetection(): void {
    this.inject(ApplicationRef).tick();
  }

  /**
   * Runs post-test verifications. This base implementation runs [HttpTestingController#verify]{@linkcode https://angular.io/api/common/http/testing/HttpTestingController#verify}. Unlike {@link #cleanUp}, it is OK for this method to throw an error to indicate a violation.
   */
  protected verifyPostTestConditions(): void {
    this.inject(HttpTestingController).verify();
  }

  /**
   * Performs any cleanup needed at the end of each test. This base implementation calls [discardPeriodicTasks]{@linkcode https://angular.io/api/core/testing/discardPeriodicTasks} to avoid an error from the `fakeAsync` zone.
   */
  protected cleanUp(): void {
    discardPeriodicTasks();
  }

  private runWithMockedTime(test: VoidFunction): void {
    // https://github.com/angular/angular/issues/31677#issuecomment-573139551
    const now = performance.now;
    spyOn(performance, 'now').and.callFake(() => Date.now());

    jasmine.clock().install();
    fakeAsync(() => {
      jasmine.clock().mockDate(this.startTime);
      test();
    })();
    jasmine.clock().uninstall();

    performance.now = now;
  }
}
