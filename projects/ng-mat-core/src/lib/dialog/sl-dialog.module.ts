import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';

/**
 * Import this module to enable use of {@linkcode SlDialogService}
 */
@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  declarations: [DialogComponent],
})
export class SlDialogModule {}
