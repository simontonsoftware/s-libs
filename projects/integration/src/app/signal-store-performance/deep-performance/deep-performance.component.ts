import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RootStore } from '@s-libs/signal-store';
import {
  DeepState,
  runDeep,
  subscribeDeep,
} from '../../../../../signal-store/src/performance/deep-performance';
import { unsubscribe } from '../../../../../signal-store/src/performance/performance-utils';

@Component({
  selector: 'sl-deep-performance',
  imports: [FormsModule],
  templateUrl: './deep-performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeepPerformanceComponent {
  protected depth = 1000;
  protected iterations = 1000;

  #injector = inject(EnvironmentInjector);

  protected async run(): Promise<void> {
    // `any` because we import functions directly from `signal-store` and TS doesn't like that
    const store: any = new RootStore(new DeepState(this.depth));
    const injector = createEnvironmentInjector([], this.#injector);

    subscribeDeep(store, injector);
    await runDeep(store, this.iterations, async () => Promise.resolve());
    unsubscribe(this.depth, injector);
  }
}
