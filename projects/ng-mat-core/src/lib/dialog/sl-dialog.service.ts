import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DialogComponent, DialogData } from './dialog.component';

/**
 * Shows simple text dialogs with just a method call, and reduces boilerplate
 * for more complex dialogs.
 */
@Injectable({ providedIn: 'root' })
export class SlDialogService {
  constructor(private matDialog: MatDialog) {}

  async open<T>(data: DialogData<T>): Promise<T | undefined> {
    const ref = this.matDialog.open(DialogComponent, {
      data,
      autoFocus: false,
    });
    return firstValueFrom(ref.beforeClosed());
  }
}
