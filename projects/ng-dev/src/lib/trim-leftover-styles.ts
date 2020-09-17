/** @hidden */
let initialStyles: Set<HTMLStyleElement> | undefined;

/**
 * When called at the right times, this speeds up your test suite by removing `<script>` tags that Angular component tests leave in the DOM. By default Angular dynamically adds `<script>` tags into the `<head>` of the document corresponding to component styles. In Jasmine tests they are never cleaned up. This can cause hundreds or even thousands of style tags to accumulate, making component tests slow down as your test suite runs. In Chrome debugger's performance tab, this time will show up under the activity "Recalculate Style".
 *
 * The first time this function is called it memorizes the `<script>` tags in the DOM, then each time it is called after it removes any that appeared since. A simple way to use this effectively is to call it in a `beforeEach()`.
 *
 * ```ts
 * beforeEach(() => {
 *   trimLeftoverStyles();
 * });
 * ```
 */
export function trimLeftoverStyles(): void {
  const styles = new Set(Array.from(document.querySelectorAll('style')));
  if (initialStyles) {
    for (const style of styles) {
      if (!initialStyles.has(style)) {
        style.remove();
      }
    }
  } else {
    initialStyles = styles;
  }
}

/** @hidden */
export function resetTrimLeftoverStyles(): void {
  initialStyles = undefined;
}
