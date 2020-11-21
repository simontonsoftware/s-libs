import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { unsubscribe } from '../../../../app-state/src/performance/performance-utils';
import {
  runWide,
  subscribeWide,
  WideState,
} from '../../../../app-state/src/performance/wide-performance';

@Component({
  selector: 's-wide-performance',
  templateUrl: './wide-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidePerformanceComponent {
  width = 1000;
  iterations = 1000;

  run(): void {
    const store: any = new RootStore(new WideState(this.width));
    const { subscription } = subscribeWide(store);
    runWide(store, this.iterations);
    unsubscribe(subscription, this.width);
  }
}
