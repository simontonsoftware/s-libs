import { glob } from 'glob';
import { runCommand } from './shared.ts';

for (const path of glob.sync('projects/*/src/typing-tests/')) {
  runCommand(`npm run dtslint -- ${path}`);
}
