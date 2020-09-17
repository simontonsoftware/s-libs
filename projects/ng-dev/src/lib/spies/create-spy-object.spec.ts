import { expectSingleCallAndReset } from '../../public-api';
import { createSpyObject } from './create-spy-object';

class Superclass {
  a(): string {
    return 'return a';
  }

  b(): string {
    return 'return b';
  }
}

class Subclass extends Superclass {
  b(): string {
    return 'override b';
  }

  c(arg: string): string {
    return 'received ' + arg;
  }
}

describe('createSpyObject()', () => {
  it('mocks methods up the class hierarchy', () => {
    const obj = createSpyObject(Subclass);
    obj.a.and.returnValue('stubbed a');
    obj.b.and.returnValue('stubbed b');
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

    const spyObject = createSpyObject(Greeter);
    spyObject.greet.and.returnValue('Hello, stub!');
    expect(spyObject.greet('Eric')).toBe('Hello, stub!');
    expectSingleCallAndReset(spyObject.greet, 'Eric');
  });
});
