import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RootStore } from '@s-libs/ng-signal-state';
import {
  DeepState,
  runDeep,
  subscribeDeep,
} from '../../../../../ng-signal-state/src/performance/deep-performance';
import { unsubscribe } from '../../../../../ng-signal-state/src/performance/performance-utils';

@Component({
  selector: 'sl-deep-performance',
  templateUrl: './deep-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
})
export class DeepPerformanceComponent {
  protected depth = 1000;
  protected iterations = 1000;

  #injector = inject(EnvironmentInjector);

  protected async run(): Promise<void> {
    // `any` because we import functions directly from `ng-signal-state` and TS doesn't like that
    const store: any = new RootStore(new DeepState(this.depth));
    const injector = createEnvironmentInjector([], this.#injector);

    subscribeDeep(store, injector);
    await runDeep(store, this.iterations, async () => Promise.resolve());
    unsubscribe(this.depth, injector);
  }
}
