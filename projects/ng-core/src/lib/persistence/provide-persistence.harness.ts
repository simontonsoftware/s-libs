import { inject, Provider, ProviderToken } from '@angular/core';
import {
  AsyncPersistence,
  PublicInterface,
  VersionedObject,
} from '@s-libs/js-core';
import { PERSISTENCE_BACKEND_FACTORY } from './provide-persistence';

/**
 * For internal use only. Use `provideMockPersistence` from `@s-libs/ng-vitest` instead.
 *
 * @internal
 */
export function _provideMockPersistence(
  providerToken: ProviderToken<PersistenceBackendProvider<any>>,
  getInitialState: (dbName: string) => VersionedObject | undefined,
): Provider[] {
  return [
    {
      provide: PERSISTENCE_BACKEND_FACTORY,
      useFactory: () => (dbName: string) =>
        inject(providerToken)._createBackend(dbName, getInitialState(dbName)),
    },
  ];
}

interface PersistenceBackendProvider<T extends VersionedObject> {
  _createBackend(
    dbName: string,
    initialState: T | undefined,
  ): PublicInterface<AsyncPersistence<T>>;
}
