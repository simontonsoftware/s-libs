import { libraries, runCommand } from './shared';

let projects = process.argv.slice(2);
if (projects.length === 0) {
  projects = libraries;
}

for (const project of projects) {
  runCommand(
    `npx typedoc --tsconfig projects/${project}/tsconfig.lib.json --out docs/${project} projects/${project}/src/lib`,
  );
}
