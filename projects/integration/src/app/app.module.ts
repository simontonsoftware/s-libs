import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NasModelModule } from '@s-libs/ng-app-state';
import { AppComponent } from './app.component';
import { DeepPerformanceComponent } from './deep-performance/deep-performance.component';
import { WidePerformanceComponent } from './wide-performance/wide-performance.component';

@NgModule({
  imports: [BrowserModule, FormsModule, NasModelModule],
  declarations: [
    AppComponent,
    WidePerformanceComponent,
    DeepPerformanceComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
