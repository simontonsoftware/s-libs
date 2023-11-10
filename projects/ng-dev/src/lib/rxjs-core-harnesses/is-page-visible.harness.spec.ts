import { Component, DoCheck } from '@angular/core';
import { isPageVisible$ } from '@s-libs/rxjs-core';
import { ComponentContext } from '../component-context';
import { IsPageVisibleHarness } from './is-page-visible.harness';

describe('IsPageVisibleHarness', () => {
  it('triggers change detection in an `AngularContext`', () => {
    @Component({ standalone: true, template: 'Hi mom' })
    class TestComponent implements DoCheck {
      change = jasmine.createSpy();

      ngDoCheck(): void {
        this.change();
      }
    }

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const isPageVisibleHarness = new IsPageVisibleHarness();
      const { change } = ctx.getComponentInstance();
      change.calls.reset();

      isPageVisibleHarness.setVisible(false);
      expect(change).toHaveBeenCalled();
    });
  });

  describe('example from the docs', () => {
    it('works for example 1', () => {
      const isPageVisibleHarness = new IsPageVisibleHarness();
      isPageVisibleHarness.setVisible(false);

      const next = jasmine.createSpy();
      isPageVisible$().subscribe(next);
      expect(next).toHaveBeenCalledWith(false);

      isPageVisibleHarness.setVisible(true);
      expect(next).toHaveBeenCalledWith(true);
    });

    it('works for example 2', () => {
      const isPageVisibleHarness = new IsPageVisibleHarness();
      expect(document.visibilityState).toBe('visible');

      isPageVisibleHarness.setVisible(false);
      expect(document.visibilityState).toBe('hidden');
    });
  });
});
