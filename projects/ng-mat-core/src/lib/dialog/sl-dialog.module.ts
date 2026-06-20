import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { SlDialogService } from './sl-dialog.service';

/**
 * Import this module to enable use of {@linkcode SlDialogService}
 */
@NgModule({ imports: [MatDialogModule], providers: [SlDialogService] })
export class SlDialogModule {}
