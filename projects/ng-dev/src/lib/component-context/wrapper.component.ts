import {
  Component,
  ComponentMirror,
  reflectComponentType,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert } from '@s-libs/js-core';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- change detection is carefully orchestrated in the typescript */
@Component({ template: '' })
export class WrapperComponent<T> {
  inputs: Partial<T> = {};
  styles: Record<string, any> = {};

  static wrap<T>(
    componentType: Type<T>,
    unboundInputs: Array<keyof T>,
  ): Array<keyof T> {
    const mirror = reflectComponentType(componentType);
    assert(mirror, 'That does not appear to be a component');
    const selector = getSelector(mirror);
    const inputs = mirror.inputs.filter(
      ({ propName }) => !unboundInputs.includes(propName as keyof T),
    );

    TestBed.overrideComponent(WrapperComponent, {
      set: { template: buildTemplate(selector, inputs) },
    });

    return inputs.map((input) => input.propName as keyof T);
  }
}

function getSelector(mirror: ComponentMirror<unknown>): string {
  let { selector } = mirror;
  if (!isValidSelector(selector)) {
    selector = 's-libs-component-under-test';
    TestBed.overrideComponent(mirror.type, { set: { selector } });
  }
  return selector;
}

function isValidSelector(selector: string): boolean {
  if (selector === 'ng-component') {
    return false;
  }
  try {
    document.createElement(selector);
    return true;
  } catch {
    return false;
  }
}

function buildTemplate(
  selector: string,
  inputs: ComponentMirror<unknown>['inputs'],
): string {
  const bindingStrings = inputs.map(
    (input) => `[${input.templateName}]="inputs.${input.propName}"`,
  );
  return `
    <div class="s-libs-dynamic-wrapper" [ngStyle]="styles">
      <${selector} ${bindingStrings.join(' ')}></${selector}>
    </div>
  `;
}
