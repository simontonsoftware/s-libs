import { AngularContext } from '../angular-context';
import { AsyncMethodController } from './async-method-controller';

describe('AsyncMethodController', () => {
  function triggerRead(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.readText();
  }

  describe('constructor', () => {
    it('sets up call tracking', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      triggerRead();
      triggerRead();
      expect(controller.match([])).toHaveLength(2);

      triggerRead();
      expect(controller.match([])).toHaveLength(1);
    });

    it('allows the controlled method to be called immediately', () => {
      // eslint-disable-next-line no-new -- nothing more is needed for this test
      new AsyncMethodController(navigator.clipboard, 'readText');

      expect(triggerRead).not.toThrow();
    });
  });

  describe('example from the docs', () => {
    it('can paste', async () => {
      const { clipboard } = navigator;
      const ctx = new AngularContext();

      // mock the browser API for pasting
      const controller = new AsyncMethodController(clipboard, 'readText');
      await ctx.run(async () => {
        // BEGIN production code that copies to the clipboard
        let pastedText: string;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        clipboard.readText().then((text) => {
          pastedText = text;
        });
        // END production code that copies to the clipboard

        await controller.expectOne([]).flush('mock clipboard contents');

        // BEGIN expect the correct results after a successful copy
        expect(pastedText!).toBe('mock clipboard contents');
        // END expect the correct results after a successful copy
      });
    });
  });
});
