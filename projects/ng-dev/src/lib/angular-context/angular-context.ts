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
  flush,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { convertTime } from '@s-libs/js-core';
import { clone, forOwn } from '@s-libs/micro-dash';
import { FakeAsyncHarnessEnvironment } from './fake-async-harness-environment';

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
 * - Automatically includes {@link https://angular.io/api/common/http/testing/HttpClientTestingModule|HttpClientTestingModule} to stub network requests without additional setup.
 * - Always verifies that no unexpected http requests were made.
 * - Automatically discards periodic tasks and flushes pending timers at the end of each test to avoid the error "X timer(s) still in the queue".
 *
 * Why does the class name end with "Next"? This replaces the old `AngularContext`, but it's a breaking change so this gives people some time to transition over. Eventually the old one will be removed and this will be renamed to `AngularContext`.
 *
 * This example tests a simple service that uses `HttpClient`, and is tested by using `AngularContext` directly. More often `AngularContext` will be used as a super class. See {@link ComponentContext} for more common use cases.
 *
 * ```ts
 * // This is the class we will test.
 * @Injectable({ providedIn: 'root' })
 * class MemoriesService {
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
 * describe('MemoriesService', () => {
 *   // Tests should have exactly 1 variable outside an "it": `ctx`.
 *   let ctx: AngularContext;
 *   beforeEach(() => {
 *     ctx = new AngularContext();
 *   });
 *
 *   it('requests a post from 1 year ago', () => {
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
export class AngularContext {
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
   * Runs `test` in a `fakeAsync` zone. It can use async/await, but be sure anything you `await` is already due to execute (e.g. if a timeout is due in 3 seconds, call `.tick(3000)` before `await`ing its result).
   *
   * Also runs the following in this order, all within the same zone:
   *
   * 1. `this.init()`
   * 2. `test()`
   * 3. `this.verifyPostTestConditions()`
   * 4. `this.cleanUp()`
   */
  run(test: () => void | Promise<void>): void {
    this.runWithMockedTime(() => {
      this.init();
      try {
        test();
        this.tick();
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
  getHarness<H extends ComponentHarness>(query: HarnessQuery<H>): Promise<H> {
    return this.loader.getHarness(query);
  }

  /**
   * Gets all component harnesses that match the query, wrapped for use in a fakeAsync test so that you do not need to `await` its results.
   */
  getAllHarnesses<H extends ComponentHarness>(
    query: HarnessQuery<H>,
  ): Promise<Array<H>> {
    return this.loader.getAllHarnesses(query);
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
   * This is a hook for subclasses to override. It is called during `run()`, before the `test()` callback. This implementation does nothing, but if you override this it is still recommended to call `super.init()` in case this implementation does something in the future.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

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
   * Performs any cleanup needed at the end of each test. This base implementation calls {@linkcode https://angular.io/api/core/testing/discardPeriodicTasks|discardPeriodicTasks} and [flush]{https://angular.io/api/core/testing/flush|flush} to avoid an error from the `fakeAsync` zone.
   */
  protected cleanUp(): void {
    discardPeriodicTasks();
    flush();
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
