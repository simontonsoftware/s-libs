import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PlaygroundComponent {}
