import { Routes } from '@angular/router';
import { AppStatePerformanceComponent } from './app-state-performance/app-state-performance.component';
import { NasModelComponent } from './nas-model/nas-model.component';
import { PlaygroundComponent } from './playground/playground.component';
import { SignalStorePerformanceComponent } from './signal-store-performance/signal-store-performance.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nas-model' },
  { path: 'nas-model', component: NasModelComponent },
  { path: 'app-state-performance', component: AppStatePerformanceComponent },
  {
    path: 'signal-store-performance',
    component: SignalStorePerformanceComponent,
  },
  { path: 'playground', component: PlaygroundComponent },
];
