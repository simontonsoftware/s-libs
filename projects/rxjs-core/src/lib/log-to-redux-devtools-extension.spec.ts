import { EMPTY, Subject } from 'rxjs';
import { expectSingleCallAndReset } from 's-ng-dev-utils';
import {
  Connection,
  Extension,
  logToReduxDevtoolsExtension,
} from './log-to-redux-devtools-extension';

describe('logToReduxDevtoolsExtension()', () => {
  const extensionKey = '__REDUX_DEVTOOLS_EXTENSION__';
  let realExtension: Extension | undefined;
  let send: jasmine.Spy;
  let connect: jasmine.Spy;

  beforeEach(() => {
    realExtension = (window as any)[extensionKey];

    send = jasmine.createSpy();
    const connection: jasmine.SpyObj<Connection> = { send };

    connect = jasmine.createSpy().and.returnValue(connection);
    const extension: jasmine.SpyObj<Extension> = { connect };

    (window as any)[extensionKey] = extension;
  });

  afterEach(() => {
    (window as any)[extensionKey] = realExtension;
  });

  it('sends each emitted value to the extension', () => {
    const subject = new Subject();
    logToReduxDevtoolsExtension(subject);

    const value1 = { a: 1 };
    subject.next(value1);
    expectSingleCallAndReset(send, {}, value1);

    const value2 = { a: 2 };
    subject.next(value2);
    expectSingleCallAndReset(send, {}, value2);
  });

  it('passes along any provided options', () => {
    const options = { autoPause: true };

    logToReduxDevtoolsExtension(EMPTY, options);

    expectSingleCallAndReset(connect, options);
  });

  it('gracefully handles when there is no extension', () => {
    delete (window as any)[extensionKey];
    const warn = spyOn(console, 'warn');
    const subject = new Subject();

    logToReduxDevtoolsExtension(subject);
    expectSingleCallAndReset(warn, 'No redux devtools extension found');

    expect(() => {
      subject.next({ a: 1 });
    }).not.toThrowError();
  });
});
