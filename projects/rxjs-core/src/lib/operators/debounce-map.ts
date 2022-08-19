import { Deferred } from '@s-libs/js-core';
import { bindKey, flow } from '@s-libs/micro-dash';
import { debounce, from, Observable, OperatorFunction } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

/**
 * It's like {@linkcode https://rxjs-dev.firebaseapp.com/api/operators/exhaustMap exhaustMap}, except it debounces upstream emissions until the previous result completes.
 *
 * ```
 * source:                     -0-1-2-------3-|
 *                              i--B-|
 *                                   i--B-|
 *                                          i--B-|
 * debounceMap((i) => i--B-|): -0--B-2--B---3--B-|
 */
export function debounceMap<UpstreamType, DownstreamType>(
  map: (
    input: UpstreamType,
  ) => PromiseLike<DownstreamType> | Observable<DownstreamType>,
): OperatorFunction<UpstreamType, DownstreamType> {
  let lastOperationComplete = Promise.resolve();
  return flow(
    debounce<UpstreamType>(async () => lastOperationComplete),
    switchMap((value) => {
      const deferred = new Deferred<void>();
      lastOperationComplete = deferred.promise;
      return from(map(value)).pipe(finalize(bindKey(deferred, 'resolve')));
    }),
  );
}
