import { buildableLibraries, runCommand } from './shared';

let projects = process.argv.slice(2);
if (projects.length === 0) {
  projects = buildableLibraries;
}

for (const project of projects) {
  runCommand(
    `npx typedoc --options scripts/typedoc.mjs --tsconfig projects/${project}/tsconfig.lib.json --out docs/${project} projects/${project}/src/public-api.ts`,
  );
}
runCommand(
  `npx sassdoc -c projects/ng-mat-core/sassdoc-config.json projects/ng-mat-core/src/lib/theming`,
);
runCommand('git add docs/*');
