import { AfterViewInit, Directive, effect, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@s-libs/app-state';
import { DirectiveSuperclass } from '@s-libs/ng-core';

@Directive({ selector: '[nasModel]', standalone: false })
export class NasModelDirective<T>
  extends DirectiveSuperclass
  implements AfterViewInit
{
  protected readonly nasModel = input.required<Store<T> | null>();
  protected readonly disabled = input(false);
  #valueAccessor = inject(NG_VALUE_ACCESSOR, { self: true })[0];

  constructor() {
    super();

    effect(() => {
      this.unsubscribe();

      const store = this.nasModel();
      if (store) {
        this.manage(
          store.$.subscribe((value) => {
            this.#valueAccessor.writeValue(value);
          }),
        );
      }
    });
    effect(() => {
      this.#valueAccessor.setDisabledState?.(this.disabled());
    });
  }

  ngAfterViewInit(): void {
    this.#valueAccessor.registerOnChange((value: T) => {
      this.nasModel()?.set(value);
    });
  }
}
