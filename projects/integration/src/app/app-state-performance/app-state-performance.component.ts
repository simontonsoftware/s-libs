import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeepPerformanceComponent } from './deep-performance/deep-performance.component';
import { WidePerformanceComponent } from './wide-performance/wide-performance.component';

@Component({
  selector: 'sl-app-state-performance',
  templateUrl: './app-state-performance.component.html',
  styleUrl: './app-state-performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [WidePerformanceComponent, DeepPerformanceComponent],
})
export class AppStatePerformanceComponent {}
