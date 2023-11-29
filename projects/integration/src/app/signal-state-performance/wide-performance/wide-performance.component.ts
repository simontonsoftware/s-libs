import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { RootStore } from '@s-libs/ng-signal-state';
import { unsubscribe } from '../../../../../ng-signal-state/src/performance/performance-utils';
import {
  runWide,
  subscribeWide,
  WideState,
} from '../../../../../ng-signal-state/src/performance/wide-performance';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'sl-wide-performance',
  templateUrl: './wide-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
})
export class WidePerformanceComponent {
  protected width = 1000;
  protected iterations = 1000;

  #injector = inject(EnvironmentInjector);

  protected async run(): Promise<void> {
    // `any` because we import functions directly from `ng-signal-state` and TS doesn't like that
    const store: any = new RootStore(new WideState(this.width));
    const injector = createEnvironmentInjector([], this.#injector);

    subscribeWide(store, injector);
    await runWide(store, this.iterations, async () => Promise.resolve());
    unsubscribe(this.width, injector);
  }
}
