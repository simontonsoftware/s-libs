import { map as _map } from '@s-libs/micro-dash';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

type BuildDownstreamItem<UpstreamType, DownstreamType> = (
  upstreamItem: UpstreamType,
  key: keyof any,
) => DownstreamType;

export function mapAndCacheElements<UpstreamType, DownstreamType>(
  buildCacheKey: (upstreamItem: UpstreamType, key: keyof any) => any,
  buildDownstreamItem: BuildDownstreamItem<UpstreamType, DownstreamType>,
): OperatorFunction<UpstreamType | null | undefined, DownstreamType[]> {
  let cache = new Map<any, DownstreamType>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return map((upstreamItems: any) => {
    const nextCache = new Map<any, DownstreamType>();

    const downstreamItems = _map(upstreamItems, (upstreamItem, key) => {
      const cacheKey = buildCacheKey(upstreamItem, key);

      let downstreamItem: DownstreamType;
      if (cache.has(cacheKey)) {
        downstreamItem = cache.get(cacheKey)!;
      } else if (nextCache.has(cacheKey)) {
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
