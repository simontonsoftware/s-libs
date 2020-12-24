- Add a new feature to skip binding to specific inputs (or something like that)
- Write migration guide from `ComponentContext` -> `ComponentContextNext`
  - Rename `input` to `inputs`
  - All variables set via `inputs` must be Angular `@Input()`s
  - Change `ctx.fixture.componentInstance` -> `ctx.getComponentInstance()`
  - Components with default values for inputs will need to use `.doNotBindTo()`
- Investigate error while build `ng-dev`:
  > WARNING: No name was provided for external module '@s-libs/js-core' in output.globals – guessing 'jsCore'
  > WARNING: No name was provided for external module '@s-libs/micro-dash' in output.globals – guessing 'microDash'
- landing page to link to all API docs
- Set width/height/border for the wrapper component in `ComponentContextNext`
- coveralls
  - help may be here, to combine multiple coverage runs into one report: https://github.com/angular/angular-cli/issues/11268
- Watch for when typedoc can support that "lib" mode that would eliminate the need for @hidden
