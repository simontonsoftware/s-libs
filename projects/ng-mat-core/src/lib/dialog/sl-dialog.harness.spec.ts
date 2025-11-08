import { AngularContext } from '@s-libs/ng-dev';
import { DialogData } from './dialog.component';
import { SlDialogHarness } from './sl-dialog.harness';
import { SlDialogModule } from './sl-dialog.module';
import { SlDialogService } from './sl-dialog.service';

describe('SlDialogHarness', () => {
  let ctx: AngularContext;
  beforeEach(() => {
    ctx = new AngularContext({ imports: [SlDialogModule] });
  });

  function open(data: DialogData<unknown>): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    openWithPromise(data);
  }

  async function openWithPromise<T>(
    data: DialogData<T>,
  ): Promise<T | undefined> {
    const promise = ctx.inject(SlDialogService).open(data);
    ctx.tick();
    return promise;
  }

  describe('.with()', () => {
    it('can search by title', () => {
      ctx.run(async () => {
        open({ title: 'Correct Title' });

        expect(
          await ctx.hasHarness(
            SlDialogHarness.with({ title: 'Correct Title' }),
          ),
        ).toBe(true);
        expect(
          await ctx.hasHarness(
            SlDialogHarness.with({ title: 'Incorrect Title' }),
          ),
        ).toBe(false);
      });
    });

    it('can search by default things', () => {
      ctx.run(async () => {
        open({ title: 'Correct Title' });

        expect(
          await ctx.hasHarness(SlDialogHarness.with({ ancestor: 'body' })),
        ).toBe(true);
        expect(
          await ctx.hasHarness(SlDialogHarness.with({ ancestor: 'p' })),
        ).toBe(false);
      });
    });
  });

  describe('.getTitle()', () => {
    it('gets the dialog title', () => {
      ctx.run(async () => {
        open({ title: 'The Title' });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getTitle()).toBe('The Title');
      });
    });

    it('can handle when there is no title', () => {
      ctx.run(async () => {
        open({});
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getTitle()).toBe('');
      });
    });
  });

  describe('.getContentText()', () => {
    it('gets the content text', () => {
      ctx.run(async () => {
        open({ text: 'Some text.' });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getContentText()).toBe('Some text.');
      });
    });

    it('can handle when there is no text', () => {
      ctx.run(async () => {
        open({});
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getContentText()).toBe('');
      });
    });
  });

  describe('.getButtonText()', () => {
    it('gets the text of all buttons', () => {
      ctx.run(async () => {
        open({ buttons: [{ text: 'Button 1' }, { text: 'Button 2' }] });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getButtonText()).toEqual(['Button 1', 'Button 2']);
      });
    });

    it('can handle when there are no buttons', () => {
      ctx.run(async () => {
        open({ buttons: [] });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getButtonText()).toEqual([]);
      });
    });
  });

  describe('.getButtonColors()', () => {
    it('gets the color of all buttons', () => {
      ctx.run(async () => {
        open({ buttons: [{ text: '1', color: 'warn' }, { text: '2' }] });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getButtonColors()).toEqual(['warn', 'primary']);
      });
    });

    it('can handle when there are no buttons', () => {
      ctx.run(async () => {
        open({ buttons: [] });
        const dialog = await ctx.getHarness(SlDialogHarness);
        expect(await dialog.getButtonColors()).toEqual([]);
      });
    });
  });

  describe('.clickButton()', () => {
    it('clicks the button with the given text', () => {
      ctx.run(async () => {
        const promise = openWithPromise({
          buttons: [{ text: '1' }, { text: '2' }],
        });
        const dialog = await ctx.getHarness(SlDialogHarness);

        await dialog.clickButton('2');

        expect(await promise).toBe('2');
      });
    });
  });

  describe('.close()', () => {
    it('closes the dialog', () => {
      ctx.run(async () => {
        open({});
        const dialog = await ctx.getHarness(SlDialogHarness);
        await dialog.close();
        expect(await ctx.hasHarness(SlDialogHarness)).toBe(false);
      });
    });
  });
});
