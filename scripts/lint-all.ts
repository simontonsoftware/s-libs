import { libraries, runCommand } from './shared';

runCommand('yarn lint');
runCommand('yarn eslint');
for (const project of libraries) {
  runCommand(`yarn dtslint projects/${project}/src/typing-tests`);
}
