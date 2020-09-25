import { ComponentFixture, flushMicrotasks } from '@angular/core/testing';

/** @hidden */
export function findButton(
  fixture: ComponentFixture<any>,
  text: string,
): HTMLButtonElement {
  const found = fixture.debugElement.query(
    (candidate) =>
      candidate.nativeElement.nodeName === 'BUTTON' &&
      candidate.nativeElement.textContent.trim() === text,
  );
  if (found) {
    return found.nativeElement;
  } else {
    throw new Error('No button with text ' + text);
  }
}

/** @hidden */
export function find<T extends Element>(
  fixture: ComponentFixture<any>,
  cssSelector: string,
): T {
  const found = fixture.nativeElement.querySelector(cssSelector) as T;
  if (found) {
    return found;
  } else {
    throw new Error('could not find ' + cssSelector);
  }
}

/** @hidden */
export function click(element: Element): void {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  flushMicrotasks();
}

/** @hidden */
export function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  flushMicrotasks();
}
