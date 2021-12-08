import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  provideValueAccessor,
  WrappedFormControlSuperclass,
} from '@s-libs/ng-core';

@Component({
  selector: 'sl-wrapped-control',
  templateUrl: './wrapped-control.component.html',
  styleUrls: ['./wrapped-control.component.scss'],
  providers: [provideValueAccessor(WrappedControlComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrappedControlComponent extends WrappedFormControlSuperclass<string> {}
