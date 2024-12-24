import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ComponentContext } from '@s-libs/ng-dev';
import { ComponentHarnessSuperclass } from './component-harness-superclass';

describe('ComponentHarnessSuperclass', () => {
  it('has a working getTopLevelHarness()', () => {
    @Component({
      selector: 'sl-inner-component',
      standalone: true,
      template: ``,
    })
    class InnerComponent {}

    @Component({
      imports: [InnerComponent, MatButtonModule],
      template: `
        <button mat-button>Outer Button</button>
        <sl-inner-component />
      `,
    })
    class TestComponent {}

    class InnerComponentHarness extends ComponentHarnessSuperclass {
      static hostSelector = 'sl-inner-component';

      async getButton(): Promise<MatButtonHarness> {
        return this.getTopLevelHarness(MatButtonHarness);
      }
    }

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const innerComponent = await ctx.getHarness(InnerComponentHarness);
      expect(await innerComponent.getButton()).toBeInstanceOf(MatButtonHarness);
    });
  });

  it('has a working getAllTopLevelHarnesses()', () => {
    @Component({
      selector: 'sl-inner-component',
      standalone: true,
      template: ``,
    })
    class InnerComponent {}

    @Component({
      imports: [InnerComponent, MatButtonModule],
      template: `
        <button mat-button>Button 1</button>
        <button mat-button>Button 2</button>
        <sl-inner-component />
      `,
    })
    class TestComponent {}

    class InnerComponentHarness extends ComponentHarnessSuperclass {
      static hostSelector = 'sl-inner-component';

      async getButtons(): Promise<MatButtonHarness[]> {
        return this.getAllTopLevelHarnesses(MatButtonHarness);
      }
    }

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const innerComponent = await ctx.getHarness(InnerComponentHarness);
      const buttons = await innerComponent.getButtons();
      expect(buttons.length).toBe(2);
    });
  });

  it('allows harness to restrict their loaders to sub-components (a bug that bugged me for a long time!)', () => {
    @Component({
      selector: 'sl-inner-component',
      imports: [MatButtonModule],
      template: `<button mat-button>Inner Button</button>`,
    })
    class InnerComponent {}

    @Component({
      imports: [InnerComponent, MatButtonModule],
      template: `
        <button mat-button>Outer Button</button>
        <sl-inner-component />
      `,
    })
    class TestComponent {}

    class InnerComponentHarness extends ComponentHarnessSuperclass {
      static hostSelector = 'sl-inner-component';
    }

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const myComponent = await ctx.getHarness(InnerComponentHarness);
      const button = await myComponent.getHarness(MatButtonHarness);
      expect(await button.getText()).toBe('Inner Button');
    });
  });
});
