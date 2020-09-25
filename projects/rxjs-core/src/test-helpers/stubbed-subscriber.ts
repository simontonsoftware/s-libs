import { expectSingleCallAndReset } from 's-ng-dev-utils';

export class StubbedSubscriber {
  next = jasmine.createSpy();
  error = jasmine.createSpy();
  complete = jasmine.createSpy();

  expectNoCalls(): void {
    expect(this.next).not.toHaveBeenCalled();
    expect(this.error).not.toHaveBeenCalled();
    expect(this.complete).not.toHaveBeenCalled();
  }

  expectReceivedOnlyValue(value: any): void {
    expectSingleCallAndReset(this.next, value);
    expect(this.error).not.toHaveBeenCalled();
    expect(this.complete).not.toHaveBeenCalled();
  }

  expectReceivedOnlyError(ex: any): void {
    expect(this.next).not.toHaveBeenCalled();
    expectSingleCallAndReset(this.error, ex);
    expect(this.complete).not.toHaveBeenCalled();
  }
}
