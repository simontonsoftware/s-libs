import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { flush } from '@angular/core/testing';
import { bindKey } from '@s-libs/micro-dash';
import { AngularContext } from './angular-context';

/** @hidden */
export class FakeAsyncHarnessEnvironment extends HarnessEnvironment<Element> {
  static documentRootLoader(ctx: AngularContext): FakeAsyncHarnessEnvironment {
    return new FakeAsyncHarnessEnvironment(document.body, ctx);
  }

  protected constructor(rawRootElement: Element, private ctx: AngularContext) {
    super(rawRootElement);
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    flush();
  }

  async forceStabilize(): Promise<void> {
    this.ctx.tick();
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new FakeAsyncHarnessEnvironment(element, this.ctx);
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
