import { expectExactContents } from '../expectations/expect-exact-contents';
import { staticTest } from '../static-test/static-test';
import { MockController } from './mock-controller';
import { TestCall } from './test-call';

describe('CallTracker', () => {
  describe('.expectOne()', () => {
    it('finds a matching method call', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn('value 1');
      fn('value 2');

      const match = controller.expectOne(['value 2']);

      expect(match.getArgs()[0]).toEqual('value 2');
    });

    it('throws when there is no match', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn();

      expect(() => {
        controller.expectOne(() => false);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there have been no calls', () => {
      const controller = new MockController(vi.fn());

      expect(() => {
        controller.expectOne(() => true);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 0',
      );
    });

    it('throws when there is more than one match', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn();
      fn();

      expect(() => {
        controller.expectOne(() => true);
      }).toThrow(
        'Expected one matching call(s) for criterion "Match by function: ", found 2',
      );
    });

    it('has fancy typing', () => {
      staticTest(() => {
        type FnType = (arg: string) => Date;
        const fn = vi.fn<FnType>();
        const controller = new MockController(fn);
        expectTypeOf(controller.expectOne)
          .parameter(0)
          .toEqualTypeOf<[string] | ((call: TestCall<FnType>) => boolean)>();
      });
    });
  });

  describe('.expectNone()', () => {
    it('throws if any call matches', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn('value 1');
      fn('value 2');

      expect(() => {
        controller.expectNone(['value 2']);
      }).toThrow(
        'Expected zero matching call(s) for criterion "Match by arguments: ["value 2"]", found 1',
      );
    });

    it('does not throw when no call matches', () => {
      const controller = new MockController(vi.fn());

      expect(() => {
        controller.expectNone(() => false);
      }).not.toThrow();
    });
  });

  describe('.match()', () => {
    it('finds matching method calls', () => {
      const fn = vi.fn<(arg: string) => void>();
      const controller = new MockController(fn);
      fn('value 1');
      fn('value 2');
      fn('value 3');

      const matches = controller.match(
        (call) => call.getArgs()[0] !== 'value 2',
      );

      expectExactContents(
        matches.map((match) => match.getArgs()[0]),
        ['value 1', 'value 3'],
      );
    });

    it('accepts an array of arguments to match against', () => {
      const fn = vi.fn<(arg: string) => void>();
      const controller = new MockController(fn);
      fn('value 1');
      fn('value 2');
      fn('value 1');

      const matches = controller.match(['value 1']);

      expectExactContents(
        matches.map((call) => call.getArgs()[0]),
        ['value 1', 'value 1'],
      );
    });

    it('uses deep equality matching for the arguments shorthand', () => {
      const fn = vi.fn<(arg: { method: string }) => void>();
      const controller = new MockController(fn);
      fn({ method: 'GET' });
      fn({ method: 'POST' });
      fn({ method: 'GET' });

      const matches = controller.match([{ method: 'GET' }]);

      expectExactContents(
        matches.map((call) => call.getArgs()[0]),
        [{ method: 'GET' }, { method: 'GET' }],
      );
    });

    it('removes the matching calls from future matching', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn('value 1');
      fn('value 2');

      controller.match(['value 2']);

      expect(controller.match(() => true).length).toBe(1);
    });

    it('returns an empty array when there have been no calls', () => {
      const controller = new MockController(vi.fn());
      const matches = controller.match(() => false);
      expect(matches).toEqual([]);
    });

    it('gracefully handles when no calls match', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn();

      const matches = controller.match(() => false);

      expect(matches).toEqual([]);
    });
  });

  describe('.verify()', () => {
    it('does not throw when all calls have been expected', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);

      // no error when no calls were made at all
      expect(() => {
        controller.verify();
      }).not.toThrow();

      // no error when a call was made, but also already expected
      fn();
      controller.expectOne([]);
      expect(() => {
        controller.verify();
      }).not.toThrow();
    });

    it('throws if there is an outstanding call, including the number of them', () => {
      const fn = vi.fn();
      const controller = new MockController(fn);

      // when multiple calls have not been expected
      fn('call 1');
      fn('call 2');
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
      const fn = vi.fn();
      const controller = new MockController(fn);
      fn('call 1');
      fn('call 2');

      expect(() => {
        controller.verify();
      }).toThrow(/\n {2}\["call 1"\]\n {2}\["call 2"\]/u);
    });
  });
});
