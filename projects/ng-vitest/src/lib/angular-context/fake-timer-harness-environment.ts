import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { bindKey } from '@s-libs/micro-dash';
import { vi } from 'vitest';
import { AngularContext } from './angular-context';

export class FakeTimerHarnessEnvironment extends HarnessEnvironment<Element> {
  protected constructor(
    rawRootElement: Element,
    private ctx: AngularContext,
  ) {
    super(rawRootElement);
  }

  static documentRootLoader(ctx: AngularContext): FakeTimerHarnessEnvironment {
    return new FakeTimerHarnessEnvironment(document.body, ctx);
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    console.log('outsidealizing');
    await vi.runAllTimersAsync();
  }

  async forceStabilize(): Promise<void> {
    await this.ctx.tick();
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new FakeTimerHarnessEnvironment(element, this.ctx);
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
