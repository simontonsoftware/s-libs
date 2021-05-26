import { OperatorFunction } from 'rxjs';
import { mapAndCacheElements } from './map-and-cache-elements';

type ArrayIteratee<I, O> = (item: I, index: number) => O;

/**
 * Applies `buildDownstreamItem` to each item in the upstream array and emits the result. Each downstream item is cached using the key generated by `buildCacheKey` so that the next emission contains references to the matching objects from the previous emission, without running `buildDownstreamItem` again. The cache is only held between successive emissions.
 *
 * This is useful e.g. when using the result in an `*ngFor` expression of an angular template, to prevent angular from rebuilding the inner component and to allow `OnPush` optimizations in the inner component.
 *
 * If multiple items in an upstream array have the same cache key, it will only call `buildDownstreamItem` once.
 *
 * ```ts
 * const mapWithCaching = mapAndCacheArrayElements(
 *   (item) => item,
 *   (item) => item + 1
 * )
 * ```
 * ```
 * source:         -[1, 2]---[1, 2, 3]---[2]--|
 * mapWithCaching: -[2, 3]---[2, 3, 4]---[3]--|
 * ```
 */
export const mapAndCacheArrayElements = mapAndCacheElements as <
  UpstreamType,
  DownstreamType,
>(
  buildCacheKey: ArrayIteratee<UpstreamType, any>,
  buildDownstreamItem: ArrayIteratee<UpstreamType, DownstreamType>,
) => OperatorFunction<UpstreamType[] | null | undefined, DownstreamType[]>;
