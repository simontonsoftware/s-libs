import { libraries, runCommand } from './shared';

for (const project of libraries) {
  runCommand(
    `yarn docs --tsconfig projects/${project}/tsconfig.lib.json --out docs/${project} projects/${project}/src/lib`,
  );
}
