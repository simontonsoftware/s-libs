import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert } from '@s-libs/js-core';
import { flatten, map } from '@s-libs/micro-dash';

export function createDynamicWrapper<T>(componentType: Type<T>): Type<T> {
  const selector = getSelector(componentType);
  const inputs = getInputs(componentType);

  const template = `
    <div>
      <${selector}
        ${inputs
          .map(({ binding, property }) => `[${binding}]="${property}"`)
          .join(' ')}
      ></${selector}>
    </div>
  `;

  @Component({ template })
  class DynamicWrapperComponent {}

  return DynamicWrapperComponent as Type<T>;
}

function getSelector(componentType: Type<unknown>): string {
  const annotations = Reflect.getOwnPropertyDescriptor(
    componentType,
    '__annotations__',
  );
  assert(annotations, 'That does not appear to be a component');

  let selector = annotations.value.find((decorator: any) => decorator.selector)
    ?.selector;
  if (!isValidSelector(selector)) {
    selector = 's-libs-component-under-test';
    TestBed.overrideComponent(componentType, { set: { selector } });
  }
  return selector;
}

function isValidSelector(selector: string): boolean {
  if (!selector) {
    return false;
  }
  try {
    document.createElement(selector);
    return true;
  } catch {
    return false;
  }
}

export function getInputs(
  componentType: any,
): Array<{ binding: string; property: string }> {
  return flatten(
    map(componentType.propDecorators, (decorators: any[], property: string) => {
      const inputDecorators = decorators.filter(
        (decorator) => decorator.type.prototype.ngMetadataName === 'Input',
      );
      return inputDecorators.map((decorator) => {
        const binding = decorator.args?.[0] || property;
        return { property, binding };
      });
    }),
  );
}
