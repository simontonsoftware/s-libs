import { Component, DoCheck } from '@angular/core';
import { noop } from '@s-libs/micro-dash';
import { isPageVisible$ } from '@s-libs/rxjs-core';
import { ComponentContext } from '../component-context';
import { IsPageVisibleHarness } from './is-page-visible.harness';

describe('IsPageVisibleHarness', () => {
  it('triggers change detection in an `AngularContext`', () => {
    @Component({ template: 'Hi mom' })
    class TestComponent implements DoCheck {
      change = jasmine.createSpy();

      ngDoCheck(): void {
        this.change();
      }
    }

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const harness = new IsPageVisibleHarness();
      const { change } = ctx.getComponentInstance();
      change.calls.reset();

      harness.setVisible(false);
      expect(change).toHaveBeenCalled();
    });
  });

  it('allows multiple listeners', () => {
    const harness = new IsPageVisibleHarness();
    const listener1 = jasmine.createSpy();
    const listener2 = jasmine.createSpy();
    isPageVisible$().subscribe(listener1);
    isPageVisible$().subscribe(listener2);

    harness.setVisible(false);

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('allows document listeners for other events (prod bug)', () => {
    // eslint-disable-next-line no-new -- the purpose is to test the side effect
    new IsPageVisibleHarness();
    expect(() => {
      try {
        document.addEventListener('keydown', noop);
      } finally {
        document.removeEventListener('keydown', noop);
      }
    }).not.toThrow();
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
