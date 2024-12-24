import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ComponentContext } from '@s-libs/ng-dev';
import { matButtonHarnessWithIcon } from './mat-button-harness-with-icon';

describe('matButtonHarnessWithIcon()', () => {
  it('filters to the right buttons', () => {
    @Component({
      imports: [MatButtonModule, MatIconModule, MatIconTestingModule],
      template: `
        <button mat-icon-button><mat-icon>good</mat-icon></button>
        <button mat-icon-button><mat-icon>bad</mat-icon></button>
        <button mat-icon-button><mat-icon>good</mat-icon></button>
      `,
    })
    class ManyIconsComponent {}

    const ctx = new ComponentContext(ManyIconsComponent);
    ctx.run(async () => {
      const buttons = await ctx.getAllHarnesses(
        matButtonHarnessWithIcon({ name: 'good' }),
      );
      expect(buttons.length).toBe(2);
    });
  });

  it('allows use of material button filters', () => {
    @Component({
      imports: [MatButtonModule, MatIconModule, MatIconTestingModule],
      template: `
        <button mat-icon-button><mat-icon>icon</mat-icon></button>
        <button mat-fab><mat-icon>fab</mat-icon></button>
      `,
    })
    class ManyIconsComponent {}

    const ctx = new ComponentContext(ManyIconsComponent);
    ctx.run(async () => {
      const buttons = await ctx.getAllHarnesses(
        matButtonHarnessWithIcon({ variant: 'fab' }),
      );
      expect(buttons.length).toBe(1);
      expect(await buttons[0].getText()).toBe('fab');
    });
  });

  it('only finds buttons with icons', () => {
    @Component({
      imports: [MatButtonModule, MatIconModule, MatIconTestingModule],
      template: `
        <button mat-button><mat-icon>has icon</mat-icon></button>
        <button mat-button>no icon</button>
      `,
    })
    class ManyIconsComponent {}

    const ctx = new ComponentContext(ManyIconsComponent);
    ctx.run(async () => {
      const buttons = await ctx.getAllHarnesses(matButtonHarnessWithIcon({}));
      expect(buttons.length).toBe(1);
      expect(await buttons[0].getText()).toBe('has icon');
    });
  });
});
