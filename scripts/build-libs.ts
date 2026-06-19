import { buildableLibraries, runCommand } from './shared.ts';

for (const project of buildableLibraries) {
  runCommand(`npm run build -- ${project}`);
}
