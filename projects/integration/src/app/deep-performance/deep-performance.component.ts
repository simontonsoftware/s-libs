import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import {
  DeepState,
  runDeep,
  subscribeDeep,
} from '../../../../app-state/src/performance/deep-performance';
import { unsubscribe } from '../../../../app-state/src/performance/performance-utils';

@Component({
  selector: 's-deep-performance',
  templateUrl: './deep-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeepPerformanceComponent {
  depth = 1000;
  iterations = 1000;

  run(): void {
    const store: any = new RootStore(new DeepState(this.depth));
    const { subscription } = subscribeDeep(store);
    runDeep(store, this.iterations);
    unsubscribe(subscription, this.depth);
  }
}
