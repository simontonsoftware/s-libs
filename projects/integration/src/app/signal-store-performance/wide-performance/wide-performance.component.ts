import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { RootStore } from '@s-libs/signal-store';
import { unsubscribe } from '../../../../../signal-store/src/performance/performance-utils';
import {
  runWide,
  subscribeWide,
  WideState,
} from '../../../../../signal-store/src/performance/wide-performance';
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
    // `any` because we import functions directly from `signal-store` and TS doesn't like that
    const store: any = new RootStore(new WideState(this.width));
    const injector = createEnvironmentInjector([], this.#injector);

    subscribeWide(store, injector);
    await runWide(store, this.iterations, async () => Promise.resolve());
    unsubscribe(this.width, injector);
  }
}
