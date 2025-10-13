import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundComponent {}
