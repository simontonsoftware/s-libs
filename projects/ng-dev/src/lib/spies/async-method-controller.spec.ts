import { AsyncMethodController } from './async-method-controller';

describe('AsyncMethodController', () => {
  describe('.match()', () => {
    it('finds matching method calls', () => {
      const asyncStub = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      navigator.clipboard.writeText('value 1');
      navigator.clipboard.writeText('value 2');
      navigator.clipboard.writeText('value 3');

      const matches = asyncStub.match((call) => call.args[0] !== 'value 2');

      expect(matches.map((match) => match.callInfo.args[0])).toEqual(
        jasmine.arrayWithExactContents(['value 1', 'value 3']),
      );
    });

    it('does not remove the matching calls from future matching', () => {
      const asyncStub = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();
      navigator.clipboard.readText();

      asyncStub.match(() => true);
      const matchesOnSecondTry = asyncStub.match(() => true);

      expect(matchesOnSecondTry.length).toEqual(2);
    });

    it('returns an empty array when there have been no calls', () => {
      const asyncStub = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const matches = asyncStub.match(() => false);
      expect(matches).toEqual([]);
    });

    it('can gracefully handle when no calls match', () => {
      const asyncStub = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();

      const matches = asyncStub.match(() => false);

      expect(matches).toEqual([]);
    });
  });
});
