import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DialogComponent, DialogData } from './dialog.component';

/**
 * Shows simple text dialogs with just a method call, and reduces boilerplate for more complex dialogs.
 *
 * A simple text dialog:
 * ```ts
 * const choice = await slDialogService.open({
 *   text: 'Discard draft?',
 *   buttons: [{ text: 'Cancel' }, { text: 'Discard' }]
 * });
 * if (choice === 'Discard') {
 *   // discard the draft
 * }
 * ```
 *
 * Using a custom component:
 * ```ts
 * @Component({
 *   template: `
 *     <h3>Heading 1</h3>
 *     <p>Paragraph 1</p>
 *     <h3>Heading 2</h3>
 *     <p>Paragraph 2</p>
 *   `
 * })
 * class FancyDialogComponent {}
 *
 * slDialogService.open({
 *   title: 'My title',
 *   component: FancyDialogComponent,
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SlDialogService {
  constructor(private matDialog: MatDialog) {}

  /**
   * Resolves when the dialog is closed. Resolves to the {@link DialogButton.value} of the clicked button, or to `undefined` if the dialog was closed another way (such as clicking off it).
   */
  async open<T>(data: DialogData<T>): Promise<T | undefined> {
    const ref = this.matDialog.open(DialogComponent, {
      data,
      autoFocus: false,
    });
    return firstValueFrom(ref.beforeClosed());
  }
}
