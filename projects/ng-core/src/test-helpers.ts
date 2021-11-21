import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { AngularContext } from '@s-libs/ng-dev';

export function findButton(
  fixture: ComponentFixture<any>,
  text: string,
): HTMLButtonElement {
  const found = fixture.debugElement.query(
    (candidate) =>
      candidate.nativeElement.nodeName === 'BUTTON' &&
      candidate.nativeElement.textContent.trim() === text,
  ) as DebugElement | null;
  if (found === null) {
    throw new Error('No button with text ' + text);
  } else {
    return found.nativeElement;
  }
}

export function find<T extends Element>(
  fixture: ComponentFixture<any>,
  cssSelector: string,
): T {
  const found = fixture.nativeElement.querySelector(cssSelector) as T | null;
  if (found === null) {
    throw new Error('could not find ' + cssSelector);
  } else {
    return found;
  }
}

export function click(element: Element): void {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  AngularContext.getCurrent()!.tick();
}

export function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  AngularContext.getCurrent()!.tick();
}
