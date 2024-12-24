import {
  AfterViewInit,
  Directive,
  Inject,
  Input,
  OnDestroy,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@s-libs/app-state';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[nasModel]',
  standalone: false,
})
export class NasModelDirective<T> implements AfterViewInit, OnDestroy {
  #store!: Store<T> | null;
  #subscription?: Subscription;
  #valueAccessor: ControlValueAccessor;

  constructor(
    @Self()
    @Inject(NG_VALUE_ACCESSOR)
    valueAccessors: ControlValueAccessor[],
  ) {
    this.#valueAccessor = valueAccessors[0];
  }

  @Input()
  set nasModel(store: Store<T> | null) {
    this.#subscription?.unsubscribe();

    this.#store = store;
    this.#subscription = store?.$.subscribe((value) => {
      this.#valueAccessor.writeValue(value);
    });
  }

  @Input()
  set disabled(isDisabled: boolean | null) {
    this.#valueAccessor.setDisabledState?.(isDisabled ?? false);
  }

  ngAfterViewInit(): void {
    this.#valueAccessor.registerOnChange((value: T) => {
      this.#store?.set(value);
    });
  }

  ngOnDestroy(): void {
    this.#subscription?.unsubscribe();
  }
}
