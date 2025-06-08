import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Registers a Material {@link https://material.angular.dev/components/icon/overview#icon-sets | icon set} in the default namespace.
 *
 * **WARNING:** The `icons` string you pass in will bypass Angular's security measures! Including untrusted user data will expose your application to XSS security risks!
 *
 * By default, Angular Material configures your app to download font files that include **all** material icons. This is a helper for a technique to:
 *
 * - only download the icons your app uses
 * - eliminate flickering in the UI that otherwise happens before the fonts load
 * - reduce the number of network requests needed to load your app
 *
 * This technique requires you to manually download each icon you use, clean up its SVG source, and paste it into your source code. For example, you might create a file called `icons.ts` that looks like this, which contains two icons:
 * ```ts
 * export const icons = `
 * <svg id="drag_handle"><path d="M20,9H4v2h16V9z M4,15h16v-2H4V15z"/></svg>
 * <svg id="menu"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
 * `;
 * ```
 *
 * Then in your `app.config` or `app.module`, include it in your `providers` array like this:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideMatIcons(icons),
 *   ]
 * }
 * ```
 *
 * Finally, display the icons in a template like this, where `svgIcon` matches the `id` you gave it above
 * ```html
 * <mat-icon svgIcon="drag_handle" />
 * <mat-icon svgIcon="menu" />
 * ```
 *
 * To construct the `icons` string using svgs from the material team:
 *
 * 1. Find the icon on https://fonts.google.com/icons.
 * 2. Set the "Optical size" to 24px. You are free to modify other customizations.
 * 3. Download the SVG and paste its contents into your `icons` string.
 * 4. Set an `id` on the `<svg>` tag to the name of the icon.
 * 5. Delete any hard-coded colors (e.g. `fill="#000000"`)
 * 6. At this point your icon should be working. If you care to, you can delete unnecessary attributes from the SVG, such as `xmlns`, `width` and `height`. Experiment to see if anything else can be eliminated.
 */
export function provideMatIcons(icons: string): EnvironmentProviders {
  return provideAppInitializer(() => {
    inject(MatIconRegistry).addSvgIconSetLiteral(
      inject(DomSanitizer).bypassSecurityTrustHtml(
        `<svg><defs>${icons}</defs></svg>`,
      ),
    );
  });
}
