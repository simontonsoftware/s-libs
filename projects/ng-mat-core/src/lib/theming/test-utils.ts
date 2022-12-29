import { By } from '@angular/platform-browser';
import { assert } from '@s-libs/js-core';
import { AngularContext, ComponentContext } from '@s-libs/ng-dev';

export function getStyle(selector: string): CSSStyleDeclaration {
  const ctx = AngularContext.getCurrent();
  assert(ctx instanceof ComponentContext);
  return getComputedStyle(
    ctx.fixture.debugElement.query(By.css(selector)).nativeElement,
  );
}
