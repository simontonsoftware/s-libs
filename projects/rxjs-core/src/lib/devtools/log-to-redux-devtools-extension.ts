import { Observable, Subscription } from 'rxjs';
import { EnhancerOptions } from './enhancer-options';

export interface Connection {
  send: (action: any, state: any) => void;
}

export interface Extension {
  connect: (options?: EnhancerOptions) => Connection;
}

/**
 * Log the values emitted from any observable to the [redux devtools extension](https://github.com/zalmoxisus/redux-devtools-extension).
 *
 * @param options These are passed along to the extension as is. See its documentation [here](http://extension.remotedev.io/docs/API/Arguments.html).
 */
export function logToReduxDevtoolsExtension(
  observable: Observable<any>,
  options?: EnhancerOptions,
): Subscription {
  const extension: Extension | undefined = (window as any)
    .__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return new Subscription();
  }

  const connection = extension.connect(options);
  return observable.subscribe((value) => {
    connection.send({}, value);
  });
}
