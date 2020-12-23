import { ContentContainerComponentHarness } from '@angular/cdk/testing';
import { Component } from '@angular/core';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ComponentContextNext } from './component-context-next';
import { Synchronized } from './synchronize';

@Component({
  template: `
    <div class="wrapper">
      <button mat-button (click)="clicked = true">{{ clicked }}</button>
    </div>
  `,
})
class TestComponent {
  clicked = false;
}

class WrapperHarness extends ContentContainerComponentHarness {
  static hostSelector = '.wrapper';
}

describe('FakeAsyncHarnessEnvironment', () => {
  let ctx: ComponentContextNext<TestComponent>;
  beforeEach(() => {
    ctx = new ComponentContextNext(TestComponent);
  });

  it('runs asynchronous events that are due automatically', () => {
    ctx.run(() => {
      const button = ctx.getHarness(MatButtonHarness);
      button.click();
      expect(button.getText()).toBe('true');
    });
  });

  it('locates sub harnesses that are also synchronized', () => {
    ctx.run(() => {
      const button = ctx
        .getHarness(WrapperHarness)
        .getHarness(MatButtonHarness) as Synchronized<MatButtonHarness>;
      button.click();
      expect(button.getText()).toBe('true');
    });
  });
});
