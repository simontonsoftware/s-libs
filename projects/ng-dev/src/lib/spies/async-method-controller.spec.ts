import { AngularContextNext } from '../test-context/angular-context/angular-context-next';
import { AsyncMethodController } from './async-method-controller';

describe('AsyncMethodController', () => {
  describe('constructor', () => {
    it('allows the controlled method to be called immediately', () => {
      // tslint:disable-next-line:no-unused-expression
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

    describe('error message', () => {
      it('throws an error when there is no match', () => {
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

      it('throws an error when there have been no calls', () => {
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

      it('throws an error when there is more than one match', () => {
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
    });
  });

  describe('.expectNone()', () => {
    it('throws an error if any call matches', () => {
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

    it('does not throw an error when no call matches', () => {
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

    it('remove the matching calls from future matching', () => {
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

    it('can gracefully handle when no calls match', () => {
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
    it('does not throw an error when all calls have been expected', () => {
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

    it('throws an error if there is an outstanding call, including the number of open calls', () => {
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

  describe('.#buildErrorMessage()', () => {
    it('includes the given description when throwing an error', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectOne(() => true, 'show this');
      }).toThrowMatching((error: Error) =>
        error.message.includes('for criterion "show this"'),
      );
    });

    it('includes the name of the match function when throwing an error, when no description is provided', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectOne(nofindy);
      }).toThrowMatching((error: Error) =>
        error.message.includes('criterion "Match by function: nofindy"'),
      );

      function nofindy(): boolean {
        return false;
      }
    });

    it('formats the error message nicely when using the arguments shorthand', () => {
      const controller = new AsyncMethodController(window, 'fetch');

      expect(() => {
        controller.expectOne(['some url', { method: 'GET' }]);
      }).toThrowMatching((error: Error) =>
        error.message.includes(
          'for criterion "Match by arguments: ["some url",{"method":"GET"}]"',
        ),
      );
    });

    it('includes the number of matches found', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');
      navigator.clipboard.writeText('value 3');

      expect(() => {
        controller.expectOne((call) => call.args[0] !== 'value 2');
      }).toThrowMatching((error: Error) => error.message.includes('found 2'));
    });
  });

  describe('examples from the docs', () => {
    it('can paste', () => {
      const clipboard = navigator.clipboard;
      const ctx = new AngularContextNext();

      // mock the browser API for pasting
      const controller = new AsyncMethodController(clipboard, 'readText', {
        ctx,
      });
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
