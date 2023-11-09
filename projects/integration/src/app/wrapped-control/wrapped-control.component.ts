import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  provideValueAccessor,
  WrappedFormControlSuperclass,
} from '@s-libs/ng-core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'sl-wrapped-control',
    templateUrl: './wrapped-control.component.html',
    styleUrls: ['./wrapped-control.component.scss'],
    providers: [provideValueAccessor(WrappedControlComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule],
})
export class WrappedControlComponent extends WrappedFormControlSuperclass<string> {}
