import { expectTypeOf } from 'expect-type';
import { Mock } from 'vitest';
import { staticTest } from '../static-test/static-test';
import { createMockObject } from './create-mock-object';
import { expectSingleCallAndReset } from './expect-single-call-and-reset';
import { MockController } from './mock-controller';

class Superclass {
  a(): string {
    return 'return a';
  }

  b(): string {
    return 'return b';
  }
}

class Subclass extends Superclass {
  override b(): string {
    return 'override b';
  }

  c(arg: string): string {
    return `received ${arg}`;
  }
}

describe('createMockObject()', () => {
  it('mocks methods up the class hierarchy', () => {
    const obj = createMockObject(Subclass);
    obj.a.mockReturnValue('stubbed a');
    obj.b.mockReturnValue('stubbed b');
    obj.c('my arg');

    expect(obj.a()).toBe('stubbed a');
    expect(obj.b()).toBe('stubbed b');
    expectSingleCallAndReset(obj.c, 'my arg');
  });

  it('works for the example in the docs', () => {
    class Greeter {
      greet(name: string): string {
        return `Hello, ${name}!`;
      }
    }

    const mockObject = createMockObject(Greeter);
    mockObject.greet.mockReturnValue('Hello, stub!');
    expect(mockObject.greet('Eric')).toBe('Hello, stub!');
    expectSingleCallAndReset(mockObject.greet, 'Eric');
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const mockDate = createMockObject(Date);
      expectTypeOf(mockDate.getUTCDate).toExtend<Date['getUTCDate']>();
      expectTypeOf(mockDate.getUTCDate).toExtend<Mock<Date['getUTCDate']>>();
      expectTypeOf(mockDate.getUTCDate.controller).toEqualTypeOf<
        MockController<Date['getUTCDate']>
      >();
    });
  });
});
