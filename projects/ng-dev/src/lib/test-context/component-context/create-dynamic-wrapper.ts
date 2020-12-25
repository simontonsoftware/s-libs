import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert } from '@s-libs/js-core';
import { flatMap } from '@s-libs/micro-dash';

/** @hidden */
interface InputMeta<T> {
  binding: string;
  property: keyof T;
}

/** @hidden */
interface DynamicWrapper<T> {
  type: Type<T>;
  inputProperties: Array<keyof T>;
}

/** @hidden */
export function createDynamicWrapper<T>(
  componentType: Type<T>,
  unboundInputs: Array<keyof T>,
): DynamicWrapper<T> {
  const selector = getSelector(componentType);
  const inputMetas = getInputMetas(componentType).filter(
    ({ property }) => !unboundInputs.includes(property),
  );

  const template = `
    <div>
      <${selector}
        ${inputMetas
          .map(({ binding, property }) => `[${binding}]="${property}"`)
          .join(' ')}
      ></${selector}>
    </div>
  `;

  @Component({ template })
  class DynamicWrapperComponent {}

  const type = DynamicWrapperComponent as Type<T>;
  const inputProperties = inputMetas.map((meta) => meta.property);
  return { type, inputProperties };
}

/** @hidden */
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

/** @hidden */
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

/** @hidden */
function getInputMetas<T>(componentType: Type<T>): Array<InputMeta<T>> {
  return flatMap(
    (componentType as any).propDecorators,
    (decorators: any[], property: any) => {
      const inputDecorators = decorators.filter(
        (decorator) => decorator.type.prototype.ngMetadataName === 'Input',
      );
      return inputDecorators.map((decorator) => {
        const binding = decorator.args?.[0] || property;
        return { property, binding };
      });
    },
  );
}
