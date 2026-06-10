import { MockParameters } from '@vitest/spy';
import { expectTypeOf } from 'expect-type';
import { AngularContext } from '../angular-context';
import { expectExactContents } from '../expectations';
import { staticTest } from '../static-test/static-test';
import { AsyncMethodController } from './async-method-controller';

describe('AsyncMethodController', () => {
  function triggerRead(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.readText();
  }

  function triggerWrite(text: string): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.writeText(text);
  }

  describe('constructor', () => {
    it('allows the controlled method to be called immediately', () => {
      // eslint-disable-next-line no-new -- nothing more is needed for this test
      new AsyncMethodController(navigator.clipboard, 'readText');

      expect(triggerRead).not.toThrow();
    });
  });

  describe('.expectOne()', () => {
    it('finds a matching method call', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');

      const match = controller.expectOne((args) => args[0] === 'value 2');

      expect(match.args[0]).toEqual('value 2');
    });

    it('throws when there is no match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      triggerRead();

      expect(() => {
        controller.expectOne(() => false);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there have been no calls', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectOne(() => true);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there is more than one match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      triggerRead();
      triggerRead();

      expect(() => {
        controller.expectOne(() => true);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 2',
      );
    });

    it('has fancy typing', () => {
      staticTest(() => {
        const writeController = new AsyncMethodController(
          navigator.clipboard,
          'writeText',
        );
        expectTypeOf(writeController.expectOne)
          .parameter(0)
          .toEqualTypeOf<
            | ((args: MockParameters<Clipboard['writeText']>) => boolean)
            | [data: string]
          >();
        triggerWrite('fake text');
        writeController.expectOne((args) => {
          expectTypeOf(args).toEqualTypeOf<
            MockParameters<(data: string) => Promise<void>>
          >();
          return true;
        });

        const readController = new AsyncMethodController(
          navigator.clipboard,
          'readText',
        );
        expectTypeOf(readController.expectOne)
          .parameter(0)
          .toEqualTypeOf<
            ((args: MockParameters<Clipboard['readText']>) => boolean) | []
          >();
        triggerRead();
        readController.expectOne((args) => {
          expectTypeOf(args).toEqualTypeOf<
            MockParameters<() => Promise<string>>
          >();
          return true;
        });
      });
    });
  });

  describe('.expectNone()', () => {
    it('throws if any call matches', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');

      expect(() => {
        controller.expectNone((args) => args[0] === 'value 2');
      }).toThrow(
        'Expected zero matching call(s) for criterion "Match by function: ", found 1',
      );
    });

    it('does not throw when no call matches', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectNone(() => false);
      }).not.toThrow();
    });

    it('accepts an array of arguments to match against', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');

      expect(() => {
        controller.expectNone(['value 2']);
      }).toThrow(/found 1/u);
    });
  });

  describe('.match()', () => {
    it('finds matching method calls', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');
      triggerWrite('value 3');

      const matches = controller.match((args) => args[0] !== 'value 2');

      expectExactContents(
        matches.map((match) => match.args[0]),
        ['value 1', 'value 3'],
      );
    });

    it('accepts an array of arguments to match against', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');
      triggerWrite('value 1');

      const matches = controller.match(['value 1']);

      expectExactContents(
        matches.map((match) => match.args[0]),
        ['value 1', 'value 1'],
      );
    });

    it('uses deep equality matching for the arguments shorthand', () => {
      const controller = new AsyncMethodController(window, 'fetch');
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch('a fake url', { method: 'GET' });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch('a fake url', { method: 'POST' });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch('a fake url', { method: 'GET' });

      const matches = controller.match(['a fake url', { method: 'GET' }]);

      expectExactContents(
        matches.map((match) => match.args[1]),
        [{ method: 'GET' }, { method: 'GET' }],
      );
    });

    it('removes the matching calls from future matching', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('value 1');
      triggerWrite('value 2');

      controller.match((args) => args[0] === 'value 2');

      expect(controller.match(() => true).length).toBe(1);
    });

    it('returns an empty array when there have been no calls', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const matches = controller.match(() => false);
      expect(matches).toEqual([]);
    });

    it('gracefully handles when no calls match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      triggerRead();

      const matches = controller.match(() => false);

      expect(matches).toEqual([]);
    });
  });

  describe('.verify()', () => {
    it('does not throw when all calls have been expected', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      // no error when no calls were made at all
      expect(() => {
        controller.verify();
      }).not.toThrow();

      // no error when a call was made, but also already expected
      triggerRead();
      controller.expectOne([]);
      expect(() => {
        controller.verify();
      }).not.toThrow();
    });

    it('throws if there is an outstanding call, including the number of them', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );

      // when multiple calls have not been expected
      triggerWrite('call 1');
      triggerWrite('call 2');
      expect(() => {
        controller.verify();
      }).toThrow(/Expected no open call\(s\), found 2:/u);

      // when SOME calls have already been expected, but not all
      controller.expectOne(['call 2']);
      expect(() => {
        controller.verify();
      }).toThrow(/Expected no open call\(s\), found 1:/u);
    });

    it('includes a nice representation of the outstanding calls in the error message', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      triggerWrite('call 1');
      triggerWrite('call 2');

      expect(() => {
        controller.verify();
      }).toThrow(/\n {2}\["call 1"\]\n {2}\["call 2"\]/u);
    });
  });

  describe('.#ensureCallInfoIsSet()', () => {
    it('correctly initializes TestCall objects even after others have been matched', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );

      // make call1, causing:
      // testCalls: [call1]
      // spy.calls: [call1]
      triggerWrite('call1');

      // match call1, causing:
      // testCalls: []
      // spy.calls: [call1]
      controller.expectOne(() => true);

      // make call2, causing:
      // testCalls: [call2]
      // spy.calls: [call1, call2]
      triggerWrite('call2');

      // try matching call2
      const testCall = controller.expectOne(() => true);
      expect(testCall.args[0]).toBe('call2');
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
