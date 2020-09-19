import { expectSingleCallAndReset } from 's-ng-dev-utils';
import { Deferred } from './deferred';

describe('Deferred', () => {
  describe('.resolve()', () => {
    it('uses the provided value', async () => {
      const deferred = new Deferred<number>();
      deferred.resolve(42);
      expect(await deferred.promise).toBe(42);
    });

    it('runs success callback on the micro queue', async () => {
      const deferred = new Deferred<boolean>();
      let resolved = false;
      deferred.promise.then(() => (resolved = true));

      deferred.resolve(true);
      expect(resolved).toBe(false);
      await deferred.promise;
      expect(resolved).toBe(true);
    });
  });

  describe('.reject()', () => {
    it('uses the provided value', async () => {
      const deferred = new Deferred<number>();
      deferred.reject('some error');
      try {
        await deferred.promise;
        fail('should not reach here');
      } catch (ex) {
        expect(ex).toBe('some error');
      }
    });

    it('runs error callback on the micro queue', async () => {
      const deferred = new Deferred<boolean>();
      const spy = jasmine.createSpy();
      deferred.promise.catch(spy);

      deferred.reject();
      expect(spy).not.toHaveBeenCalled();
      try {
        await deferred.promise;
        fail('should not reach here');
      } catch {
        expectSingleCallAndReset(spy, undefined);
      }
    });
  });

  describe('.isPending()', () => {
    it('works when resolving', async () => {
      const deferred = new Deferred<number>();
      expect(deferred.isPending()).toBe(true);

      deferred.resolve(1);
      expect(deferred.isPending()).toBe(false);

      await deferred.promise;
      expect(deferred.isPending()).toBe(false);
    });

    it('works when rejecting', async () => {
      const deferred = new Deferred<number>();
      expect(deferred.isPending()).toBe(true);

      deferred.reject();
      expect(deferred.isPending()).toBe(false);

      try {
        await deferred.promise;
        fail('should not reach here');
      } catch {
        expect(deferred.isPending()).toBe(false);
      }
    });
  });
});
