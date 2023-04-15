import { glob } from 'glob';
import { runCommand } from './shared';

for (const path of glob.sync('projects/*/src/typing-tests/')) {
  runCommand(`npm run dtslint -- ${path}`);
}
