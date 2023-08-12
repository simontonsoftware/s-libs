import { expectSingleCallAndReset, IsPageVisibleHarness } from '@s-libs/ng-dev';
import { isPageVisible$ } from './is-page-visible';

describe('isPageVisible$()', () => {
  let harness: IsPageVisibleHarness;
  beforeEach(() => {
    harness = new IsPageVisibleHarness();
  });

  it('emits changes to page visibility', () => {
    const next = jasmine.createSpy();
    isPageVisible$().subscribe(next);
    next.calls.reset();

    harness.setVisible(false);
    expectSingleCallAndReset(next, false);

    harness.setVisible(true);
    expectSingleCallAndReset(next, true);
  });

  it('emits immediately upon subscription', () => {
    const next1 = jasmine.createSpy();
    isPageVisible$().subscribe(next1);
    expectSingleCallAndReset(next1, true);

    harness.setVisible(false);
    const next2 = jasmine.createSpy();
    isPageVisible$().subscribe(next2);
    expectSingleCallAndReset(next2, false);
  });

  it('is quiet about events that do not change visibility', () => {
    const next = jasmine.createSpy();
    isPageVisible$().subscribe(next);

    harness.setVisible(true);
    harness.setVisible(true);
    expectSingleCallAndReset(next, true);

    harness.setVisible(false);
    harness.setVisible(false);
    expectSingleCallAndReset(next, false);
  });
});
