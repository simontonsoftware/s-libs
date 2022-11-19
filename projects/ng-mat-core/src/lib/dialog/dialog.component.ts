import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
  Injector,
  Type,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

export type DialogButtonColor = NonNullable<ThemePalette> | 'default';

export interface DialogButton<T> {
  text: string;
  /**
   * {@link SlDialogService.open} will resolve to this value when the button is clicked. Defaults to {@link text}.
   */
  value?: T;
  /**
   * Defaults to `'primary'`, in accordance with the Material Design spec examples.
   */
  color?: DialogButtonColor;
}

export interface DialogData<T> {
  title?: string;

  /**
   * Shown as the main content of the dialog.
   */
  text?: string;

  /**
   * A custom component to project into the dialog's content. It will appear below `text`, if both are defined. Note that you may put a static `title` attribute on the dialog class itself instead of using the {@link DialogData.title} option above. If both are defined, the option above will be used.
   */
  component?: Type<any> & { title?: string };

  /**
   * Use this to supply input to a custom component. Inject it into the component using the {@link SL_DIALOG_DATA} injection token.
   *
   * ```ts
   * @Component({ template: '{{ myInput }}' })
   * class MyDialogComponent {
   *   constructor(@Inject(SL_DIALOG_DATA) public myInput: string) {}
   * }
   *
   * slDialogService.open({
   *   component: MyDialogComponent,
   *   slDialogData: 'My input.',
   * });
   * ```
   */
  slDialogData?: any;

  buttons?: Array<DialogButton<T>>;
}

/**
 * Injection token for a custom dialog component to receive input. See {@link DialogData.slDialogData}.
 */
export const SL_DIALOG_DATA = new InjectionToken('SL_DIALOG_DATA');

/**
 * The {@link DialogButton.value} for the default "OK" button that is used if you do not specify any custom buttons for your dialog.
 */
export const DEFAULT_OK_VALUE = Symbol('OK');

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
    data.buttons ??= [{ text: 'OK', value: DEFAULT_OK_VALUE }];
    this.componentInjector = Injector.create({
      providers: [{ provide: SL_DIALOG_DATA, useValue: data.slDialogData }],
      parent: injector,
    });
  }
}
