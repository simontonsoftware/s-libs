import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularContext } from './angular-context';
import { MockErrorHandler } from './mock-error-handler';
import { expectSingleCallAndReset } from './spies';

describe('MockErrorHandler', () => {
  let consoleSpy: jasmine.Spy;
  beforeEach(() => {
    consoleSpy = spyOn(console, 'error');
  });

  describe('createProvider()', () => {
    it('makes MockErrorHandler the ErrorHandler', () => {
      TestBed.configureTestingModule({
        providers: [MockErrorHandler.createProvider()],
      });
      expect(TestBed.inject(ErrorHandler)).toBe(
        TestBed.inject(MockErrorHandler),
      );
    });
  });

  describe('handleError()', () => {
    it("calls through to Angular's handleError()", () => {
      TestBed.inject(MockErrorHandler).handleError('blah');
      expectSingleCallAndReset(consoleSpy, 'ERROR', 'blah');
    });
  });

  describe('.expectOne()', () => {
    it('finds a matching error', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));

      const match = handler.expectOne('error 2');

      expect(match.message).toEqual('error 2');
    });

    it('throws when there is no match', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError('blah');

      expect(() => {
        handler.expectOne(() => false);
      }).toThrowError(
        'Expected one matching error(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there have been no errors', () => {
      const handler = TestBed.inject(MockErrorHandler);

      expect(() => {
        handler.expectOne(() => true);
      }).toThrowError(
        'Expected one matching error(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there is more than one match', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError('blah');
      handler.handleError('blah');

      expect(() => {
        handler.expectOne(() => true);
      }).toThrowError(
        'Expected one matching error(s) for criterion "Match by function: ", found 2',
      );
    });
  });

  describe('expectNone()', () => {
    it('throws if any error matches', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));

      expect(() => {
        handler.expectNone('error 2');
      }).toThrowError(
        'Expected zero matching error(s) for criterion "Match by string: error 2", found 1',
      );
    });

    it('does not throw when no error matches', () => {
      const handler = TestBed.inject(MockErrorHandler);

      expect(() => {
        handler.expectNone(() => false);
      }).not.toThrowError();
    });
  });

  describe('match()', () => {
    it('finds matching errors', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError('error 1');
      handler.handleError('error 2');
      handler.handleError('error 3');

      const matches = handler.match((error) => error !== 'error 2');

      expect(matches).toEqual(['error 1', 'error 3']);
    });

    it('accepts string shorthand', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));
      handler.handleError(new Error('error 3'));

      const matches = handler.match('error 2');

      expect(matches).toEqual([new Error('error 2')]);
    });

    it('accepts RegExp shorthand', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));
      handler.handleError(new Error('error 3'));

      const matches = handler.match(/2/);

      expect(matches).toEqual([new Error('error 2')]);
    });

    it('removes the matching calls from future matching', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));

      handler.match('error 2');

      expect(handler.match(() => true)).toEqual([new Error('error 1')]);
    });

    it('returns an empty array when there have been no errors', () => {
      expect(TestBed.inject(MockErrorHandler).match(() => false)).toEqual([]);
    });

    it('gracefully handles when no errors match', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(new Error('error 1'));
      expect(handler.match(() => false)).toEqual([]);
    });

    it('gracefully handles cleverly constructed errors that try to cause errors', () => {
      const handler = TestBed.inject(MockErrorHandler);
      handler.handleError(undefined);
      handler.handleError({ messages: new Date() });
      handler.handleError({ messages: { matches: new Date() } });
      expect(() => {
        handler.match('a string');
        handler.match(/a regexp/);
        handler.match(() => true);
      }).not.toThrowError();
    });
  });

  describe('verify()', () => {
    it('does not throw when all errors have been expected', () => {
      const handler = TestBed.inject(MockErrorHandler);

      // no error when no calls were made at all
      expect(() => {
        handler.verify();
      }).not.toThrowError();

      // no error when a call was made, but also already expected
      handler.handleError(new Error('error 1'));
      handler.match(() => true);
      expect(() => {
        handler.verify();
      }).not.toThrowError();
    });

    it('throws if there is an outstanding error, including the number of them', () => {
      const handler = TestBed.inject(MockErrorHandler);

      // when multiple errors have not been expected
      handler.handleError(new Error('error 1'));
      handler.handleError(new Error('error 2'));
      expect(() => {
        handler.verify();
      }).toThrowError('Expected no error(s), found 2');

      // when SOME errors have already been expected, but not all
      handler.match('error 2');
      expect(() => {
        handler.verify();
      }).toThrowError('Expected no error(s), found 1');
    });
  });

  describe('example from the docs', () => {
    it('tracks errors', () => {
      const ctx = new AngularContext();
      ctx.run(() => {
        // test something that is supposed to throw an error
        ctx.inject(ErrorHandler).handleError(new Error('special message'));

        // expect that it did
        ctx.inject(MockErrorHandler).expectOne('special message');
      });
    });
  });
});
