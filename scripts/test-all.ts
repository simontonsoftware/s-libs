import { buildableLibraries, runCommand } from './shared.ts';

const vitestProjects = new Set(['ng-vitest']);

const testableProjects = [...buildableLibraries, 'integration'];
for (const project of testableProjects) {
  if (vitestProjects.has(project)) {
    runCommand(`npm run test -- ${project}`);
  } else {
    runCommand(
      `npm run test -- ${project} --no-watch --no-progress --browsers=ChromeHeadless`,
    );
  }
}
