import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { unsubscribe } from '../../../../../app-state/src/performance/performance-utils';
import {
  runWide,
  subscribeWide,
  WideState,
} from '../../../../../app-state/src/performance/wide-performance';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'sl-wide-performance',
  imports: [FormsModule],
  templateUrl: './wide-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidePerformanceComponent {
  width = 1000;
  iterations = 1000;

  run(): void {
    // `any` because we import functions directly from `app-state` and TS doesn't like that
    const store: any = new RootStore(new WideState(this.width));
    const { subscription } = subscribeWide(store);
    runWide(store, this.iterations);
    unsubscribe(subscription, this.width);
  }
}
