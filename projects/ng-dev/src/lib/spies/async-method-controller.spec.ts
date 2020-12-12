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

    it('does not remove the matching calls from future matching', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();
      navigator.clipboard.readText();

      controller.match(() => true);
      const matchesOnSecondTry = controller.match(() => true);

      expect(matchesOnSecondTry.length).toEqual(2);
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

  describe('.expectOne', () => {
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

    it('removes the matching call from future matching', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');

      controller.expectOne((call) => call.args[0] === 'value 2');

      expect(controller.match(() => true).length).toBe(1);
    });

    it('throws an error when there is no match', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();

      expect(() => {
        controller.expectOne(() => false);
      }).toThrowError(
        'Expected one matching request for criterion "Match by function: ", found none',
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
        'Expected one matching request for criterion "Match by function: ", found none',
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
        'Expected one matching request for criterion "Match by function: ", found 2',
      );
    });

    it('includes the given description when throwing an error', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectOne(() => true, 'show this');
      }).toThrowError(
        'Expected one matching request for criterion "show this", found none',
      );
    });

    it('includes the name of the match function when throwing an error, when no description is provided', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      expect(() => {
        controller.expectOne(nofindy);
      }).toThrowError(
        'Expected one matching request for criterion "Match by function: nofindy", found none',
      );

      function nofindy(): boolean {
        return false;
      }
    });
  });
});
