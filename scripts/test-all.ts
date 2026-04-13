// This script is no better than `ng test`, except that it seemed to get buggy in Angular 21. In CI it gave this error _when moving on to the second project_:
// ```
// Error: Schema validation failed with the following errors:
//  Data path "/browsers" must be array.
// ```
// So this script is a workaround. It runs the tests on one project at a time.

import { buildableLibraries, runCommand } from './shared';

const testableProjects = [...buildableLibraries, 'integration'];
for (const project of testableProjects) {
  runCommand(
    `npm run test -- ${project} --no-watch --no-progress --browsers=ChromeHeadless`,
  );
}
