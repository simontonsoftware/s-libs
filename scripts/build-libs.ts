import { buildableLibraries, runCommand } from './shared';

for (const project of buildableLibraries) {
  runCommand(`npm run build -- ${project}`);
}
