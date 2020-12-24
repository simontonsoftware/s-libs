import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert } from '@s-libs/js-core';
import { flatMap } from '@s-libs/micro-dash';

interface InputMeta<ComponentUnderTest> {
  binding: string;
  property: keyof ComponentUnderTest;
}

interface DynamicWrapper<ComponentUnderTest> {
  type: Type<ComponentUnderTest>;
  inputProperties: Array<keyof ComponentUnderTest>;
}

export function createDynamicWrapper<ComponentUnderTest>(
  componentType: Type<ComponentUnderTest>,
  unboundInputs: Array<keyof ComponentUnderTest>,
): DynamicWrapper<ComponentUnderTest> {
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

  const type = DynamicWrapperComponent as Type<ComponentUnderTest>;
  const inputProperties = inputMetas.map((meta) => meta.property);
  return { type, inputProperties };
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

function getInputMetas<ComponentUnderTest>(
  componentType: Type<ComponentUnderTest>,
): Array<InputMeta<ComponentUnderTest>> {
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
