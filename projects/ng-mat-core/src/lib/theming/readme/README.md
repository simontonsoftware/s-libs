Here is a basic example to set up theming for Angular Material, with both light and dark themes that respect `prefers-color-scheme`.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";

$light: theming.from-flat(
  $primary: mat.$blue-palette,
);
$dark: theming.from-flat(
  $primary: mat.$blue-palette,
  $theme-type: "dark",
);
@include theming.full($light, $dark);
```

If you only want one theme, that is possible.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";

@include mat.core(); // needed when you don't use the `full-theming` mixin
$light: theming.from-flat(
  $primary: mat.$blue-palette,
);
@include mat.all-component-themes($light);
```

Here is a more complex example. It uses custom theme colors you've created using [Material's schematic](https://material.angular.io/guide/theming#custom-theme) for light, dark, and high-contrast themes. By default, it respects `prefers-color-scheme` to choose between light and dark. It allows you to force a specific theme when you add a class to any element (like `body`), so that you can implement a theme chooser.

This also demonstrates restricting the emitted styles to only the components you include in your app.

```scss
@use "@angular/material" as mat;
@use "@s-libs/ng-mat-core/theming";
@use "./path/to/light-and-dark/m3-theme";
@use "./path/to/high-contrast/m3-theme" as contrast-theme;

$modules: ("core", "button", "card", "checkbox", "form-field", "input", "list");

@include theming.full-theming(m3-theme.$light-theme, m3-theme.$dark-theme, $modules);
.force-light-theme {
  @include theming.colors(m3-theme.$light-theme);
}
.force-dark-theme {
  @include theming.colors(m3-theme.$dark-theme);
}
.force-contrast-theme {
  @include theming.colors(contrast-theme.$light-theme);
}
```
