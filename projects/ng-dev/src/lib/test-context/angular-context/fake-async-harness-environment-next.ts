import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { flush } from '@angular/core/testing';
import { bindKey } from '@s-libs/micro-dash';
import { AngularContextNext } from './angular-context-next';

/** @hidden */
export class FakeAsyncHarnessEnvironmentNext extends HarnessEnvironment<Element> {
  static documentRootLoader(
    ctx: AngularContextNext,
  ): FakeAsyncHarnessEnvironmentNext {
    return new FakeAsyncHarnessEnvironmentNext(document.body, ctx);
  }

  protected constructor(
    rawRootElement: Element,
    private ctx: AngularContextNext,
  ) {
    super(rawRootElement);
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    flush();
  }

  async forceStabilize(): Promise<void> {
    this.ctx.tick();
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new FakeAsyncHarnessEnvironmentNext(element, this.ctx);
  }

  protected createTestElement(element: Element): UnitTestElement {
    return new UnitTestElement(element, bindKey(this, 'forceStabilize'));
  }

  protected async getAllRawElements(selector: string): Promise<Element[]> {
    return Array.from(this.rawRootElement.querySelectorAll(selector));
  }

  protected getDocumentRoot(): Element {
    return document.body;
  }
}
