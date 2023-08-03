import { HarnessPredicate } from '@angular/cdk/testing';
import {
  ButtonHarnessFilters,
  MatButtonHarness,
} from '@angular/material/button/testing';
import { MatIconHarness } from '@angular/material/icon/testing';

/**
 * A set of criteria that can be used to filter a list of button harness instances.
 */
export interface IconButtonHarnessFilters extends ButtonHarnessFilters {
  /**
   * Only find instances which contain an icon with the given name.
   */
  name?: RegExp | string;
}

/**
 * Returns a predicate to query for `MatButtonHarness` that contains a specific icon. Respects all filter options of `MatButtonHarness` itself, and adds the option to specify the name of an icon which must exist inside the button. If no icon name is specified, finds buttons with any icon.
 *
 * ```ts
 * const saveButton =
 *   await loader.getHarness(matButtonHarnessWithIcon({ name: 'save' }));
 * ```
 */
export function matButtonHarnessWithIcon(
  options: IconButtonHarnessFilters,
): HarnessPredicate<MatButtonHarness> {
  return MatButtonHarness.with(options).add('icon', async (harness) =>
    harness.hasHarness(MatIconHarness.with({ name: options.name })),
  );
}
