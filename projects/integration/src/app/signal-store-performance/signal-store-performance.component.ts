import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeepPerformanceComponent } from './deep-performance/deep-performance.component';
import { WidePerformanceComponent } from './wide-performance/wide-performance.component';

@Component({
  selector: 'sl-signal-store-performance',
  templateUrl: './signal-store-performance.component.html',
  styleUrls: ['./signal-store-performance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DeepPerformanceComponent, WidePerformanceComponent],
})
export class SignalStorePerformanceComponent {}
