Here is a basic example to set up theming for Angular Material, with both light and dark themes that respect `prefers-color-scheme`.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";

@include theming.full-theming(
  $dark-palettes: (
    primary: mat.define-palette(mat.$light-blue-palette),
    accent: mat.define-palette(mat.$orange-palette, A200, A100, A400),
  ),
  $light-palettes: (
    primary: mat.define-palette(mat.$blue-palette),
    accent: mat.define-palette(mat.$orange-palette, A400, A200, A700),
  )
);
```

If you only want one theme, that is possible.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";

@include mat.core(); // needed when you don't use the `full-theming` mixin
@include theming.light-theme(
  (
    $light-palettes: (
      primary: mat.define-palette(mat.$blue-palette),
      accent: mat.define-palette(mat.$orange-palette, A400, A200, A700),
    ),
  )
);
```

Here is a more complex example. It uses the same colors for light and dark themes, and adds a third high-contrast theme. By default, it respects `prefers-color-scheme` to choose between light and dark. But it allows you to force a specific theme when you add a class to any element (like `body`), so that you can implement a theme chooser.

This also demonstrates restricting the emitted styles to only the components you include in your app.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";

$main-palettes: (
  primary: mat.define-palette(mat.$blue-grey-palette, 600, 300, 800, 500),
  accent: mat.define-palette(mat.$brown-palette, A400, A200, A700),
);
$high-contrast-palettes: (
  primary: mat.define-palette(mat.$blue-grey-palette, 400, 400),
  accent: mat.define-palette(mat.$orange-palette, 500),
);
$config: (
  dark-palettes: $main-palettes,
  light-palettes: $main-palettes,
  contrast-palettes: $high-contrast-palettes,
  modules: (
    "core",
    "button",
    "card",
    "checkbox",
    "form-field",
    "input",
    "list",
  ),
);

@include theming.full-theming($config...);
.force-light-theme {
  @include theming.light-theme-colors($config);
}
.force-dark-theme {
  @include theming.dark-theme-colors($config);
}
.force-contrast-theme {
  @include theming.light-theme-colors($config, "contrast-palettes");
}
```
