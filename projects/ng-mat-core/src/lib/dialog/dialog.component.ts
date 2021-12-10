import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
  Injector,
  Type,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export type DialogButtonColor = NonNullable<ThemePalette> | 'default';

export interface DialogButton<T> {
  text: string;
  value?: T;
  color?: DialogButtonColor;
}

export interface DialogData<T> {
  title?: string;
  text?: string;
  component?: Type<any> & { title?: string };
  slDialogData?: any;
  buttons?: Array<DialogButton<T>>;
}

export const SL_DIALOG_DATA = new InjectionToken('SL_DIALOG_DATA');
export const OK_VALUE = Symbol('OK');

@Component({
  selector: 'sl-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  public componentInjector: Injector;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<unknown>,
    injector: Injector,
  ) {
    data.buttons ??= [{ text: 'OK', value: OK_VALUE }];
    this.componentInjector = Injector.create({
      providers: [{ provide: SL_DIALOG_DATA, useValue: data.slDialogData }],
      parent: injector,
    });
  }
}
