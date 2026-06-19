import { staticTest } from '../static-test/static-test';
import { MockController } from './mock-controller';
import { TestCall } from './test-call';

describe('MockController', () => {
  it('correctly initializes TestCall objects even after others have been matched', () => {
    const mock = vi.fn();
    const controller = new MockController(mock);
    controller.verify();

    // make call1, causing:
    // testCalls: [call1]
    // mock.calls: [call1]
    mock('call1');

    // match call1, causing:
    // testCalls: []
    // mock.calls: [call1]
    controller.expectOne(() => true);

    // make call2, causing:
    // testCalls: [call2]
    // mock.calls: [call1, call2]
    mock('call2');

    // try matching call2
    const testCall = controller.expectOne(() => true);
    expect(testCall.getArgs()[0]).toBe('call2');
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const datePred = new MockController(vi.fn<(arg: Date) => boolean>());
      datePred.expectOne([new Date()]);
      // @ts-expect-error -- require exact tuple [Date]
      datePred.expectOne([]);
      datePred.expectOne((call) => {
        expectTypeOf(call).toEqualTypeOf<TestCall<(arg: Date) => boolean>>();
        return true;
      });
    });
  });
});
