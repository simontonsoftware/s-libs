import { Injectable } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { logToReduxDevtoolsExtension } from '@s-libs/rxjs-core';
import { NasModelState } from './nas-model-state';

@Injectable({ providedIn: 'root' })
export class NasModelStore extends RootStore<NasModelState> {
  constructor() {
    super(new NasModelState());
    logToReduxDevtoolsExtension(this.$, {
      name: 'Integration store',
      autoPause: true,
    });
  }
}
