import * as microDash from '@s-libs/micro-dash';
import { keys } from '@s-libs/micro-dash';

describe('micro-dash', () => {
  // the public API is already well tested via the micro-dash-sizes project

  describe('as a UMD bundle', () => {
    it('is available at sLibs.microDash', () => {
      expect(keys((window as any).sLibs.microDash)).toEqual(
        jasmine.arrayWithExactContents(keys(microDash)),
      );
    });
  });
});
