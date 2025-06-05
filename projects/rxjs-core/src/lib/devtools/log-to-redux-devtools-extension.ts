import { Observable, Subscription } from 'rxjs';
import { EnhancerOptions } from './enhancer-options';

export interface Connection {
  send: (action: any, state: any) => void;
}

export interface Extension {
  connect: (options?: EnhancerOptions) => Connection;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: Extension;
  }
}

/**
 * Log the values emitted from any observable to the [redux devtools extension](https://github.com/reduxjs/redux-devtools).
 *
 * @param options These are passed along to the extension as is. See its documentation [here](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md).
 */
export function logToReduxDevtoolsExtension(
  observable: Observable<any>,
  options?: EnhancerOptions,
): Subscription {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return new Subscription();
  }

  const connection = extension.connect(options);
  return observable.subscribe((value) => {
    connection.send({}, value);
  });
}
