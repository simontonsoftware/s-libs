import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NasModelModule } from '@s-libs/ng-app-state';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeepPerformanceComponent } from './app-state-performance/deep-performance/deep-performance.component';
import { NasModelComponent } from './nas-model/nas-model.component';
import { WidePerformanceComponent } from './app-state-performance/wide-performance/wide-performance.component';
import { AppStatePerformanceComponent } from './app-state-performance/app-state-performance.component';
import { WrappedControlComponent } from './wrapped-control/wrapped-control.component';
import { PlaygroundComponent } from './playground/playground.component';

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    NasModelModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AppComponent,
    AppStatePerformanceComponent,
    DeepPerformanceComponent,
    NasModelComponent,
    PlaygroundComponent,
    WidePerformanceComponent,
    WrappedControlComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
