import { Component, Inject } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AngularContext } from '@s-libs/ng-dev';
import {
  DialogData,
  DEFAULT_OK_VALUE,
  SL_DIALOG_DATA,
} from './dialog.component';
import { SlDialogHarness } from './sl-dialog.harness';
import { SlDialogModule } from './sl-dialog.module';
import { SlDialogService } from './sl-dialog.service';

describe('DialogComponent', () => {
  let ctx: AngularContext;
  beforeEach(() => {
    ctx = new AngularContext({
      imports: [SlDialogModule, NoopAnimationsModule],
    });
  });

  async function open<T>(data: DialogData<unknown>): Promise<T | unknown> {
    const dialog = ctx.inject(SlDialogService).open(data);
    ctx.tick();
    return dialog;
  }

  it('displays a title', () => {
    ctx.run(async () => {
      open({ title: 'Show Me This!' });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getTitle()).toBe('Show Me This!');
    });
  });

  it('displays text', () => {
    ctx.run(async () => {
      open({ text: 'Show me this.' });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getContentText()).toBe('Show me this.');
    });
  });

  it('displays a component', () => {
    @Component({ template: 'Show me this.' })
    class ContentComponent {}

    ctx.run(async () => {
      open({ component: ContentComponent });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getContentText()).toBe('Show me this.');
    });
  });

  it('displays the title from a component', () => {
    @Component({ template: '' })
    class TitledComponent {
      static title = 'Component Title';
    }

    ctx.run(async () => {
      open({ component: TitledComponent });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getTitle()).toBe('Component Title');
    });
  });

  it('overrides the component title with the direct title', () => {
    @Component({ template: '' })
    class TitledComponent {
      static title = 'Component Title';
    }

    ctx.run(async () => {
      open({ title: 'Direct Title', component: TitledComponent });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getTitle()).toBe('Direct Title');
    });
  });

  it('can inject input to a component', () => {
    @Component({ template: '{{ myInput }}' })
    class MyDialogComponent {
      constructor(@Inject(SL_DIALOG_DATA) public myInput: string) {}
    }

    ctx.run(async () => {
      open({ component: MyDialogComponent, slDialogData: 'My input.' });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getContentText()).toBe('My input.');
    });
  });

  it('defaults to an "OK" button with primary color and DEFAULT_OK_VALUE', () => {
    ctx.run(async () => {
      const closedPromise = open({});

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getButtonText()).toEqual(['OK']);
      expect(await dialog.getButtonColors()).toEqual(['primary']);

      await dialog.clickButton('OK');
      expect(await closedPromise).toBe(DEFAULT_OK_VALUE);
    });
  });

  it('accepts custom buttons', () => {
    ctx.run(async () => {
      const closedPromise = open({
        buttons: [
          { text: 'Prime', value: 'value 1', color: 'primary' },
          { text: 'Warn', value: 'value 2', color: 'warn' },
        ],
      });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getButtonText()).toEqual(['Prime', 'Warn']);
      expect(await dialog.getButtonColors()).toEqual(['primary', 'warn']);

      await dialog.clickButton('Warn');
      expect(await closedPromise).toBe('value 2');
    });
  });

  it('defaults custom buttons to primary color', () => {
    ctx.run(async () => {
      open({ buttons: [{ text: 'Color me', value: 'blah' }] });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getButtonColors()).toEqual(['primary']);
    });
  });

  it('defaults custom button values to their text', () => {
    ctx.run(async () => {
      const closedPromise = open({ buttons: [{ text: 'Click me' }] });
      const dialog = await ctx.getHarness(SlDialogHarness);

      await dialog.clickButton('Click me');

      expect(await closedPromise).toBe('Click me');
    });
  });

  it('allows creating buttons with the default color', () => {
    ctx.run(async () => {
      open({
        buttons: [{ text: 'No color', value: 'blah', color: 'default' }],
      });

      const dialog = await ctx.getHarness(SlDialogHarness);
      expect(await dialog.getButtonColors()).toEqual(['default']);
    });
  });

  it('display button text in all caps (per design spec examples)', () => {
    ctx.run(async () => {
      open({ buttons: [{ text: 'Not All Caps', value: 'blah' }] });

      const button = document.querySelector('button')!;
      expect(getComputedStyle(button).textTransform).toBe('uppercase');
    });
  });
});
