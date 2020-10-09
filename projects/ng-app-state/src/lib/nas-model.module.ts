import { NgModule } from '@angular/core';
import { NasModelDirective } from './nas-model.directive';
import { CheckboxValueAccessorDirective } from './value-accessors/checkbox-value-accessor.directive';
import { InputValueAccessorDirective } from './value-accessors/input-value-accessor.directive';
import { NumberValueAccessorDirective } from './value-accessors/number-value-accessor.directive';
import { RadioValueAccessorDirective } from './value-accessors/radio-value-accessor.directive';
import { RangeValueAccessorDirective } from './value-accessors/range-value-accessor.directive';
import { SelectValueAccessorDirective } from './value-accessors/select-value-accessor.directive';
import { SelectMultipleValueAccessorDirective } from './value-accessors/select-multiple-value-accessor.directive';

/** @hidden */
const exportedDirectives = [
  CheckboxValueAccessorDirective,
  InputValueAccessorDirective,
  NasModelDirective,
  NumberValueAccessorDirective,
  RadioValueAccessorDirective,
  RangeValueAccessorDirective,
  SelectValueAccessorDirective,
  SelectMultipleValueAccessorDirective,
];

@NgModule({
  declarations: exportedDirectives,
  exports: exportedDirectives,
})
export class NasModelModule {}
