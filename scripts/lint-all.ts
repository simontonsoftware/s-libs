import { glob } from 'glob';
import { runCommand } from './shared';

runCommand('yarn lint');
runCommand('yarn eslint');
for (const path of glob.sync('projects/*/src/typing-tests/')) {
  runCommand(`yarn dtslint ${path}`);
}
