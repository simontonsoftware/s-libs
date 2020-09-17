import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  resetTrimLeftoverStyles,
  trimLeftoverStyles,
} from './trim-leftover-styles';

describe('trimLeftoverStyles()', () => {
  beforeEach(() => {
    resetTrimLeftoverStyles();
  });

  function getStyles(): HTMLStyleElement[] {
    return Array.from(document.querySelectorAll('style'));
  }

  it('removes (only) styles auto-added by components', () => {
    document.head.append(document.createElement('style'));
    const startingStyles = getStyles();
    expect(startingStyles.length).toBeGreaterThan(0);
    trimLeftoverStyles();

    TestBed.configureTestingModule({ declarations: [StyledComponent] });
    const fixture = TestBed.createComponent(StyledComponent);
    fixture.destroy();
    expect(getStyles().length).toBeGreaterThan(startingStyles.length);
    trimLeftoverStyles();
    expect(getStyles()).toEqual(startingStyles);
  });
});

@Component({
  template: "I'm cool",
  styles: [
    `
      :host {
        height: 20px;
        background: lightblue;
      }
    `,
  ],
})
class StyledComponent {}
