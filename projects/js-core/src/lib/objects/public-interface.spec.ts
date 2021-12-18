import { PublicInterface } from './public-interface';

describe('PublicInterface', () => {
  it('allows implementing a class without duplicating private stuff', () => {
    class Service {
      protected semiSecretState = 1;
      private secretState = 2;
      doStuff(): void {
        console.log(this.secretState, this.semiSecretState);
      }
    }

    class MockService implements PublicInterface<Service> {
      doStuffWasCalled = false;
      doStuff(): void {
        this.doStuffWasCalled = true;
      }
    }

    // convince everybody that this test does something
    new MockService().doStuff();
    expect().nothing();
  });
});
