import { InjectionToken, Provider, Type } from '@angular/core';
import { createSpyObject, SpyObject } from './create-spy-object';

export class MockBackendKit<T> {
  token: InjectionToken<SpyObject<T>>;
  providers: Provider[];

  constructor(type: Type<T>, setUpMock?: (mock: SpyObject<T>) => void) {
    this.token = new InjectionToken('', {
      factory: (): SpyObject<T> => {
        const mock = createSpyObject(type);
        setUpMock?.(mock);
        return mock;
      },
    });
    this.providers = [{ provide: type, useExisting: this.token }];
  }
}
