import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppStatePerformanceComponent } from './app-state-performance/app-state-performance.component';
import { NasModelComponent } from './nas-model/nas-model.component';
import { WrappedControlComponent } from './wrapped-control/wrapped-control.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nas-model' },
  { path: 'nas-model', component: NasModelComponent },
  { path: 'app-state-performance', component: AppStatePerformanceComponent },
  { path: 'wrapped-control', component: WrappedControlComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
