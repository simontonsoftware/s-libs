import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { DialogComponent } from './dialog.component';

/**
 * Import this module to enable use of {@linkcode SlDialogService}
 */
@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  declarations: [DialogComponent],
})
export class SlDialogModule {}
