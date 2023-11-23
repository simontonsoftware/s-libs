import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RootStore } from '@s-libs/ng-signal-state';
import {
  DeepState,
  runDeep,
  subscribeDeep,
} from '../../../../../ng-signal-state/src/performance/deep-performance';
import { unsubscribe } from '../../../../../ng-signal-state/src/performance/performance-utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'sl-deep-performance',
  templateUrl: './deep-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
})
export class DeepPerformanceComponent {
  depth = 1000;
  iterations = 1000;

  run(): void {
    // `any` because we import functions directly from `ng-signal-state` and TS doesn't like that
    const store: any = new RootStore(new DeepState(this.depth));
    const { subscription } = subscribeDeep(store);
    runDeep(store, this.iterations);
    unsubscribe(subscription, this.depth);
  }
}
