import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assert, isDefined } from '@s-libs/js-core';
import { forOwn } from '@s-libs/micro-dash';

interface InputMeta<T> {
  binding: string;
  property: keyof T;
}

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- change detection is carefully orchestrated in the typescript */
@Component({ template: '' })
export class WrapperComponent<T> {
  static wrap<T>(
    componentType: Type<T>,
    unboundInputs: Array<keyof T>,
  ): Array<keyof T> {
    const selector = getSelector(componentType);
    const inputMetas = getInputMetas(componentType).filter(
      ({ property }) => !unboundInputs.includes(property),
    );

    TestBed.overrideComponent(WrapperComponent, {
      set: { template: buildTemplate(selector, inputMetas) },
    });

    return inputMetas.map((meta) => meta.property);
  }

  inputs: Partial<T> = {};
  styles: Record<string, any> = {};
}

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

function getInputMetas<T>(componentType: Type<T>): Array<InputMeta<T>> {
  let metas: Array<InputMeta<T>>;
  const superType = Object.getPrototypeOf(componentType.prototype)?.constructor;
  if (isDefined(superType)) {
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
        const binding = decorator.args?.[0] ?? property;
        metas.push({ property, binding });
      }
    },
  );
  return metas;
}

function buildTemplate<T>(
  selector: string,
  inputMetas: Array<InputMeta<T>>,
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
