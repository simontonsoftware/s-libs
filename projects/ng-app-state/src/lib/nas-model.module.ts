import { NgModule } from '@angular/core';
import { NasModelDirective } from './nas-model.directive';
import {
  CheckboxValueAccessorDirective,
  InputValueAccessorDirective,
  NumberValueAccessorDirective,
  RadioValueAccessorDirective,
  RangeValueAccessorDirective,
  SelectMultipleValueAccessorDirective,
  SelectValueAccessorDirective,
} from './value-accessors';

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

@NgModule({ declarations: exportedDirectives, exports: exportedDirectives })
export class NasModelModule {}
