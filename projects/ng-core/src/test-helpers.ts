import { DebugElement, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AngularContext, ComponentContext } from '@s-libs/ng-dev';

// These are disabled for spec files
/* eslint-disable @typescript-eslint/no-unsafe-return */

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
    throw new Error(`No button with text ${text}`);
  } else {
    return found.nativeElement;
  }
}

export function find<T extends Element>(
  fixture: ComponentFixture<unknown>,
  cssSelector: string,
): T {
  const found = fixture.nativeElement.querySelector(cssSelector) as T | null;
  if (found === null) {
    throw new Error(`could not find ${cssSelector}`);
  } else {
    return found;
  }
}

export function findDirective<T>(ctx: ComponentContext<any>, type: Type<T>): T {
  return ctx.fixture.debugElement.query(By.directive(type))
    .componentInstance as T;
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
