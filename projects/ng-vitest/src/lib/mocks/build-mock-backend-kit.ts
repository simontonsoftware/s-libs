import { InjectionToken, Provider, Type } from '@angular/core';
import { createMockObject, MockObject } from './create-mock-object';

export class MockBackendKit<T> {
  token: InjectionToken<MockObject<T>>;
  providers: Provider[];

  constructor(type: Type<T>, setUpMock?: (mock: MockObject<T>) => void) {
    this.token = new InjectionToken('', {
      factory: (): MockObject<T> => {
        const mock = createMockObject(type);
        setUpMock?.(mock);
        return mock;
      },
    });
    this.providers = [{ provide: type, useExisting: this.token }];
  }
}
