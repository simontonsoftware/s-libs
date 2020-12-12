import { TestCall } from './test-call';

type AsyncFunc = (...args: any[]) => Promise<any>;

// TODO: put some effort into the DX to infer T
export class AsyncMethodController<
  N extends PropertyKey,
  O extends { [k in N]: AsyncFunc }
> {
  #spy: jasmine.Spy<O[N]>;

  constructor(obj: O, methodName: N) {
    this.#spy = spyOn(obj, methodName as any) as any;
  }

  // TODO: match the type of the method for CallInfo
  match(
    match: (call: jasmine.CallInfo<(...args: any[]) => any>) => boolean,
  ): TestCall[] {
    return this.#spy.calls
      .all()
      .filter(match)
      .map((call) => new TestCall(call));
  }
}
