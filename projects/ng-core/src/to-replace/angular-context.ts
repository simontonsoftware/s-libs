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
import { assert } from 'js-core';
import { clone, forOwn, isFunction } from 'micro-dash';
import { isArray } from 'rxjs/internal-compatibility';

export function extendMetadata(
  metadata: TestModuleMetadata,
  toAdd: TestModuleMetadata,
): TestModuleMetadata {
  const result: any = clone(metadata);
  forOwn(toAdd, (val, key) => {
    result[key] = isArray(result[key]) ? result[key].concat(val) : val;
  });
  return result;
}

export abstract class AngularContext<InitOptions = {}> {
  startTime = new Date();

  constructor(moduleMetadata: TestModuleMetadata) {
    TestBed.configureTestingModule(
      extendMetadata(moduleMetadata, { imports: [HttpClientTestingModule] }),
    );
  }

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

    jasmine.clock().install();
    fakeAsync(() => {
      jasmine.clock().mockDate(this.startTime);
      assert(test);

      this.init(options);
      try {
        test();
        this.verify();
      } finally {
        this.cleanUp();
      }
    })();
    jasmine.clock().uninstall();
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>): T {
    return TestBed.inject(token);
  }

  tick(millis?: number): void {
    flushMicrotasks();
    this.inject(ApplicationRef).tick();
    tick(millis);
  }

  protected init(_options: Partial<InitOptions>): void {}

  protected verify(): void {
    this.inject(HttpTestingController).verify();
  }

  protected cleanUp(): void {
    discardPeriodicTasks();
  }
}
