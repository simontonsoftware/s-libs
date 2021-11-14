import { expectTypeOf } from 'expect-type';
import { AngularContext } from '../angular-context/angular-context';
import { AsyncMethodController } from './async-method-controller';
import CallInfo = jasmine.CallInfo;

describe('AsyncMethodController', () => {
  describe('constructor', () => {
    it('allows the controlled method to be called immediately', () => {
      new AsyncMethodController(navigator.clipboard, 'readText');

      expect(() => {
        navigator.clipboard.readText().then();
      }).not.toThrowError();
    });
  });

  describe('.expectOne()', () => {
    it('finds a matching method call', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');

      const match = controller.expectOne((call) => call.args[0] === 'value 2');

      expect(match.callInfo.args[0]).toEqual('value 2');
    });

    it('throws when there is no match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();

      expect(() => {
        controller.expectOne(() => false);
      }).toThrowError(
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
      }).toThrowError(
        'Expected one matching call(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there is more than one match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();
      navigator.clipboard.readText();

      expect(() => {
        controller.expectOne(() => true);
      }).toThrowError(
        'Expected one matching call(s) for criterion "Match by function: ", found 2',
      );
    });

    it('has fancy typing', () => {
      expect().nothing();

      const writeController = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      expectTypeOf(writeController.expectOne)
        .parameter(0)
        .toEqualTypeOf<
          | [data: string]
          | ((callInfo: jasmine.CallInfo<Clipboard['writeText']>) => boolean)
        >();
      navigator.clipboard.writeText('fake text');
      writeController.expectOne((callInfo) => {
        expectTypeOf(callInfo).toEqualTypeOf<
          CallInfo<(data: string) => Promise<void>>
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
          [] | ((callInfo: jasmine.CallInfo<Clipboard['readText']>) => boolean)
        >();
      navigator.clipboard.readText();
      readController.expectOne((callInfo) => {
        expectTypeOf(callInfo).toEqualTypeOf<CallInfo<() => Promise<string>>>();
        return true;
      });
    });
  });

  describe('.expectNone()', () => {
    it('throws if any call matches', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');

      expect(() => {
        controller.expectNone((call) => call.args[0] === 'value 2');
      }).toThrowError(
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
      }).not.toThrowError();
    });

    it('accepts an array of arguments to match against', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');

      expect(() => {
        controller.expectNone(['value 2']);
      }).toThrowMatching((error: Error) => error.message.includes('found 1'));
    });
  });

  describe('.match()', () => {
    it('finds matching method calls', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');
      navigator.clipboard.writeText('value 3');

      const matches = controller.match((call) => call.args[0] !== 'value 2');

      expect(matches.map((match) => match.callInfo.args[0])).toEqual(
        jasmine.arrayWithExactContents(['value 1', 'value 3']),
      );
    });

    it('accepts an array of arguments to match against', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');
      navigator.clipboard.writeText('value 1');

      const matches = controller.match(['value 1']);

      expect(matches.map((match) => match.callInfo.args[0])).toEqual(
        jasmine.arrayWithExactContents(['value 1', 'value 1']),
      );
    });

    it('uses deep equality matching for the arguments shorthand', () => {
      const controller = new AsyncMethodController(window, 'fetch');
      fetch('a fake url', { method: 'GET' });
      fetch('a fake url', { method: 'POST' });
      fetch('a fake url', { method: 'GET' });

      const matches = controller.match(['a fake url', { method: 'GET' }]);

      expect(matches.map((match) => match.callInfo.args[1])).toEqual(
        jasmine.arrayWithExactContents([{ method: 'GET' }, { method: 'GET' }]),
      );
    });

    it('removes the matching calls from future matching', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');

      controller.match((call) => call.args[0] === 'value 2');

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
      navigator.clipboard.readText();

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
      }).not.toThrowError();

      // no error when a call was made, but also already expected
      navigator.clipboard.readText();
      controller.expectOne([]);
      expect(() => {
        controller.verify();
      }).not.toThrowError();
    });

    it('throws if there is an outstanding call, including the number of them', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );

      // when multiple calls have not been expected
      navigator.clipboard.writeText('call 1');
      navigator.clipboard.writeText('call 2');
      expect(() => {
        controller.verify();
      }).toThrowMatching((error: Error) =>
        error.message.includes('Expected no open call(s), found 2:'),
      );

      // when SOME calls have already been expected, but not all
      controller.expectOne(['call 2']);
      expect(() => {
        controller.verify();
      }).toThrowMatching((error: Error) =>
        error.message.includes('Expected no open call(s), found 1:'),
      );
    });

    it('includes a nice representation of the outstanding calls in the error message', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('call 1');
      navigator.clipboard.writeText('call 2');

      expect(() => {
        controller.verify();
      }).toThrowMatching((error: Error) =>
        error.message.includes('\n  ["call 1"]\n  ["call 2"]'),
      );
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
      navigator.clipboard.writeText('call1');

      // match call1, causing:
      // testCalls: []
      // spy.calls: [call1]
      controller.expectOne(() => true);

      // make call2, causing:
      // testCalls: [call2]
      // spy.calls: [call1, call2]
      navigator.clipboard.writeText('call2');

      // try matching call2
      const testCall = controller.expectOne(() => true);
      expect(testCall.callInfo.args[0]).toBe('call2');
    });
  });

  describe('example from the docs', () => {
    it('can paste', () => {
      const { clipboard } = navigator;
      const ctx = new AngularContext();

      // mock the browser API for pasting
      const controller = new AsyncMethodController(clipboard, 'readText');
      ctx.run(() => {
        // BEGIN production code that copies to the clipboard
        let pastedText: string;
        clipboard.readText().then((text) => {
          pastedText = text;
        });
        // END production code that copies to the clipboard

        // mock the behavior when the user denies access to the clipboard
        controller.expectOne([]).flush('mock clipboard contents');

        // BEGIN expect the correct results after a successful copy
        expect(pastedText!).toBe('mock clipboard contents');
        // END expect the correct results after a successful copy
      });
    });
  });
});
