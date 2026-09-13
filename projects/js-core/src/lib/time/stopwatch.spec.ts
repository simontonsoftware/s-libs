import { Stopwatch } from './stopwatch';
import { convertTime } from './time-utils';

describe('Stopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('constructor', () => {
    it('accepts a running flag', () => {
      const started = new Stopwatch({ running: true });
      const stopped = new Stopwatch({ running: false });

      vi.advanceTimersByTime(1);

      expect(started.getElapsed()).toBe(1);
      expect(stopped.getElapsed()).toBe(0);
    });

    it('accepts previouslyElapsed', () => {
      expect(new Stopwatch({ previouslyElapsed: 23 }).getElapsed()).toBe(23);
    });

    it('defaults to running w/ no previous time', () => {
      const timer = new Stopwatch();
      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(1);
    });
  });

  describe('.start()', () => {
    it('starts the timer', () => {
      const timer = new Stopwatch({ running: false });

      timer.start();

      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(1);
    });

    it('does nothing if already running', () => {
      const timer = new Stopwatch();
      vi.advanceTimersByTime(1);

      timer.start();

      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(2);
    });

    it('resumes the timer', () => {
      const timer = new Stopwatch({ running: false, previouslyElapsed: 1 });

      timer.start();

      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(2);
    });
  });

  describe('.stop()', () => {
    it('stops the timer', () => {
      const timer = new Stopwatch();

      timer.stop();

      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(0);
    });

    it('preserves already elapsed time', () => {
      const timer = new Stopwatch({ previouslyElapsed: 1 });
      timer.stop();
      expect(timer.getElapsed()).toBe(1);
    });

    it('preserves currently elapsed time', () => {
      const timer = new Stopwatch();
      vi.advanceTimersByTime(1);

      timer.stop();

      expect(timer.getElapsed()).toBe(1);
    });
  });

  describe('.getElapsed()', () => {
    it('includes previously and currently elapsed time', () => {
      const timer = new Stopwatch({ previouslyElapsed: 1 });
      vi.advanceTimersByTime(1);
      expect(timer.getElapsed()).toBe(2);
    });
  });

  describe('.toString()', () => {
    it('goes up to days', () => {
      const timer = new Stopwatch();
      vi.advanceTimersByTime(convertTime(365, 'days', 'ms'));
      expect(timer.toString()).toBe('365 d 0 h 0 m 0 s 0 ms');
    });

    it('does not show leading zeros', () => {
      const timer = new Stopwatch();
      vi.advanceTimersByTime(1);
      expect(timer.toString()).toBe('1 ms');
    });
  });
});
