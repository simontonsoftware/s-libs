import { libraries, runCommand } from './shared';

for (const project of libraries) {
  runCommand(`yarn build --prod ${project}`);
}
