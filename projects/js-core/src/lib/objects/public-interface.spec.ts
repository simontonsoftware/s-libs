import { staticTest } from '@s-libs/ng-vitest';
import { PublicInterface } from './public-interface';

describe('PublicInterface', () => {
  it('allows implementing a class without duplicating private stuff', () => {
    staticTest(() => {
      class Service {
        protected semiSecretState = 1;
        private secretState = 2;
        #incrediblySecretState = 3;

        doStuff(): void {
          console.log(
            this.secretState,
            this.semiSecretState,
            this.#incrediblySecretState,
          );
        }
      }

      class MockService implements PublicInterface<Service> {
        doStuffWasCalled = false;
        doStuff(): void {
          this.doStuffWasCalled = true;
        }
      }

      new MockService().doStuff();
    });
  });
});
