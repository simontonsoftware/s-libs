import { Component } from '@angular/core';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';

@Component({
  selector: 's-wrapped-control',
  templateUrl: './wrapped-control.component.html',
  styleUrls: ['./wrapped-control.component.scss'],
})
export class WrappedControlComponent extends WrappedFormControlSuperclass<string> {}
