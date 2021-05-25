import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert } from '@s-libs/js-core';
import { forOwn } from '@s-libs/micro-dash';

/** @hidden */
interface InputMeta<T> {
  binding: string;
  property: keyof T;
}

/** @hidden */
export interface WrapperComponent<T> {
  inputs: Partial<T>;
  styles: { [klass: string]: any };
}

/** @hidden */
interface DynamicWrapper<T> {
  type: Type<WrapperComponent<T>>;
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

  @Component({ template: buildTemplate(selector, inputMetas) })
  class DynamicWrapperComponent {
    inputs: Partial<T> = {};
    styles: { [klass: string]: any } = {};
  }

  const inputProperties = inputMetas.map((meta) => meta.property);
  return { type: DynamicWrapperComponent, inputProperties };
}

/** @hidden */
function getSelector(componentType: Type<unknown>): string {
  const annotations = Reflect.getOwnPropertyDescriptor(
    componentType,
    '__annotations__',
  );
  assert(annotations, 'That does not appear to be a component');

  let selector = annotations.value.find(
    (decorator: any) => decorator.selector,
  )?.selector;
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
  let metas: Array<InputMeta<T>>;
  const superType = Object.getPrototypeOf(componentType.prototype)?.constructor;
  if (superType) {
    metas = getInputMetas(superType);
  } else {
    metas = [];
  }

  // I tried making this support inputs with special characters in their names, but it turns out that *Angular* can only support that when using AOT. So our *dynamic* wrapper cannot.
  forOwn(
    (componentType as any).propDecorators,
    (decorators: any[], property: any) => {
      const inputDecorators = decorators.filter(
        (decorator) => decorator.type.prototype.ngMetadataName === 'Input',
      );
      for (const decorator of inputDecorators) {
        const binding = decorator.args?.[0] || property;
        metas.push({ property, binding });
      }
    },
  );
  return metas;
}

/** @hidden */
function buildTemplate<T>(
  selector: string,
  inputMetas: InputMeta<T>[],
): string {
  const bindingStrings = inputMetas.map(
    ({ binding, property }) => `[${binding}]="inputs.${property}"`,
  );
  return `
    <div class="s-libs-dynamic-wrapper" [ngStyle]="styles">
      <${selector} ${bindingStrings.join(' ')}></${selector}>
    </div>
  `;
}
