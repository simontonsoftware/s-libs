import { map as _map } from 'micro-dash';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

/** @hidden */
export function mapAndCacheElements<UpstreamType, DownstreamType>(
  buildCacheKey: (upstreamItem: UpstreamType, key: keyof any) => any,
  buildDownstreamItem: (
    upstreamItem: UpstreamType,
    key: keyof any,
  ) => DownstreamType,
): OperatorFunction<UpstreamType, DownstreamType[]> {
  let cache: Map<any, DownstreamType> = new Map();

  return map((upstreamItems: any) => {
    const nextCache: Map<any, DownstreamType> = new Map();

    const downstreamItems = _map(upstreamItems, (upstreamItem, key) => {
      const cacheKey = buildCacheKey(upstreamItem, key);

      let downstreamItem: DownstreamType;
      if (cache.has(cacheKey)) {
        // tslint:disable-next-line:no-non-null-assertion
        downstreamItem = cache.get(cacheKey)!;
      } else if (nextCache.has(cacheKey)) {
        // tslint:disable-next-line:no-non-null-assertion
        downstreamItem = nextCache.get(cacheKey)!;
      } else {
        downstreamItem = buildDownstreamItem(upstreamItem, key);
      }

      nextCache.set(cacheKey, downstreamItem);
      return downstreamItem;
    });

    cache = nextCache;
    return downstreamItems;
  });
}
