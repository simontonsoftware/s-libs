import { Component } from '@angular/core';
import {
  provideValueAccessor,
  WrappedFormControlSuperclass,
} from '@s-libs/ng-core';

@Component({
  selector: 's-wrapped-control',
  templateUrl: './wrapped-control.component.html',
  styleUrls: ['./wrapped-control.component.scss'],
  providers: [provideValueAccessor(WrappedControlComponent)],
})
export class WrappedControlComponent extends WrappedFormControlSuperclass<string> {}
