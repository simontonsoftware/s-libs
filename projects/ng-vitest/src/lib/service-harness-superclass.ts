import { assert } from '@s-libs/js-core';
import { AngularContext } from './angular-context';

export abstract class ServiceHarnessSuperclass {
  protected getCtx(): AngularContext {
    const ctx = AngularContext.getCurrent();
    assert(ctx);
    return ctx;
  }
}
