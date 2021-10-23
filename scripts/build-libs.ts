import { buildableLibraries, runCommand } from './shared';

for (const project of buildableLibraries) {
  runCommand(`yarn build ${project}`);
}
