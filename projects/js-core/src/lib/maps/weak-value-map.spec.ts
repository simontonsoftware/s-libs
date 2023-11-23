import { WeakValueMap } from './weak-value-map';

describe('WeakValueMap', () => {
  it('returns previously set values', () => {
    const map = new WeakValueMap<string, object>();
    const value = { a: 1 };
    map.set('key', value);
    expect(map.get('key')).toBe(value);
  });

  it('can handle requests for never-set values', () => {
    const map = new WeakValueMap<string, object>();
    expect(map.get('key')).toBe(undefined);
  });
});
