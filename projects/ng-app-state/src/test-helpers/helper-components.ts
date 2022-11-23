import { Component, Injectable } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RootStore } from '@s-libs/app-state';
import { noop } from '@s-libs/micro-dash';

/* eslint-disable @typescript-eslint/no-useless-constructor -- this file does injection in funny ways */
/* eslint-disable @angular-eslint/component-max-inline-declarations,@angular-eslint/prefer-on-push-component-change-detection -- this file is for specs, and these rules are disabled for specs */

class StoreComponent<T extends object> {
  compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) =>
    o1?.id === o2?.id;

  constructor(public store: RootStore<T>) {}
}

//
// Single Value
//

@Injectable()
export class SingleValueStore extends RootStore<any> {
  constructor() {
    super('old');
  }
}

@Component({ selector: 'nas-single-value' })
export class SingleValueComponent extends StoreComponent<any> {
  constructor(store: SingleValueStore) {
    super(store);
  }
}

//
// Select City
//

export class CityState {
  selectedCity: any = {};
  cities: any[] = [];
}

@Injectable()
export class CityStore extends RootStore<CityState> {
  constructor() {
    super(new CityState());
  }
}

export const citySelectWithNullTemplate = `
  <select [nasModel]="store('selectedCity')">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
    <option [ngValue]="null">Unspecified</option>
  </select>
`;
export const citySelectWithCustomCompareFnTemplate = `
  <select [nasModel]="store('selectedCity')" [compareWith]="compareFn">
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
  </select>
`;

@Component({
  selector: 'nas-city',
  template: `
    <select [nasModel]="store('selectedCity')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{ c.name }}
      </option>
    </select>
  `,
})
export class CityComponent extends StoreComponent<CityState> {
  constructor(store: CityStore) {
    super(store);
  }
}

//
// Select Multiple Cities
//

export class MultipleCityState {
  selectedCities: any[] = [];
  cities: any[] = [];
}

@Injectable()
export class MultipleCityStore extends RootStore<MultipleCityState> {
  constructor() {
    super(new MultipleCityState());
  }
}

export const multipleCityWithCustomCompareFnTemplate = `
  <select
    multiple
    [nasModel]="store('selectedCities')"
    [compareWith]="compareFn"
  >
    <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
      {{c.name}}
    </option>
  </select>
`;

@Component({
  selector: 'nas-multiple-city',
  template: `
    <select multiple [nasModel]="store('selectedCities')">
      <option *ngFor="let c of store('cities').$ | async" [ngValue]="c">
        {{ c.name }}
      </option>
    </select>
  `,
})
export class MultipleCityComponent extends StoreComponent<MultipleCityState> {
  constructor(store: MultipleCityStore) {
    super(store);
  }
}

//
// Radio Button Menu
//

export class MenuState {
  // prettier-ignore
  food!: string;
  // prettier-ignore
  drink!: string;
}

@Injectable()
export class MenuStore extends RootStore<MenuState> {
  constructor() {
    super(new MenuState());
  }
}

@Component({
  selector: 'nas-menu',
  template: `
    <form>
      <input type="radio" value="chicken" [nasModel]="store('food')" />
      <input type="radio" value="fish" [nasModel]="store('food')" />
      <input type="radio" value="cola" [nasModel]="store('drink')" />
      <input type="radio" value="sprite" [nasModel]="store('drink')" />
    </form>
  `,
})
export class MenuComponent extends StoreComponent<MenuState> {
  constructor(store: MenuStore) {
    super(store);
  }
}

//
// Name
//

export class NameState {
  // prettier-ignore
  name!: string;
  isDisabled = false;
}

@Injectable()
export class NameStore extends RootStore<NameState> {
  constructor() {
    super(new NameState());
  }
}

@Component({
  selector: 'nas-ng-model-custom-wrapper',
  template: `
    <nas-inner-name
      [nasModel]="store('name')"
      [disabled]="store('isDisabled').$ | async"
    ></nas-inner-name>
  `,
})
export class NameComponent extends StoreComponent<NameState> {
  constructor(store: NameStore) {
    super(store);
  }
}

@Component({
  selector: 'nas-inner-name',
  template: `
    <input
      name="custom"
      [disabled]="disabled"
      [(ngModel)]="model"
      (ngModelChange)="changeFn($event)"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InnerNameComponent,
    },
  ],
})
export class InnerNameComponent implements ControlValueAccessor {
  model!: string;
  disabled = false;
  changeFn!: (value: any) => void;

  registerOnTouched = noop;

  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.changeFn = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
