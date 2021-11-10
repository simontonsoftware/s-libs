import { AsyncMethodController } from './spies';

describe('utils', () => {
  describe('buildErrorMessage()', () => {
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
});
