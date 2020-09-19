import { wrapMethod } from '../public-api';

class O {}

// $ExpectType () => void
wrapMethod({ method(): void {} }, 'method', {});
// $ExpectError
wrapMethod({ method(): void {} }, 'notTheMethod', {});
// $ExpectType () => void
wrapMethod({ method(arg: string): void {} }, 'method', {
  before(arg: string): void {},
});
wrapMethod({ method(arg: string): void {} }, 'method', {
  // $ExpectError
  before(arg: number): void {},
});

// Production bug: this was showing an error because the typing thought it was trying to wrap the wrong method
class EventTrackingService {
  sendError(message: string): void {}
  track(name: string, category: string): void {}
}
// $ExpectType () => void
wrapMethod(new EventTrackingService(), 'track', {
  before(name: string, category: string): void {},
});
