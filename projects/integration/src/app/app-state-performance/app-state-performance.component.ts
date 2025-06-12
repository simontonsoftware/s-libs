import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeepPerformanceComponent } from './deep-performance/deep-performance.component';
import { WidePerformanceComponent } from './wide-performance/wide-performance.component';

@Component({
  selector: 'sl-app-state-performance',
  imports: [WidePerformanceComponent, DeepPerformanceComponent],
  templateUrl: './app-state-performance.component.html',
  styleUrl: './app-state-performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppStatePerformanceComponent {}
