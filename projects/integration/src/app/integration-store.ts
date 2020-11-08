import { Injectable } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { logToReduxDevtoolsExtension } from '@s-libs/rxjs-core';
import { IntegrationState } from './integration-state';

@Injectable({ providedIn: 'root' })
export class IntegrationStore extends RootStore<IntegrationState> {
  constructor() {
    super(new IntegrationState());
    logToReduxDevtoolsExtension(this.$, {
      name: 'Integration store',
      autoPause: true,
    });
  }
}
