import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    templateUrl: './playground.component.html',
    styleUrls: ['./playground.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class PlaygroundComponent {}
