import { execSync } from 'child_process';
import { copyFileSync } from 'fs';
import { createInterface } from 'readline';

// in dependency order
export const libraries = [
  'micro-dash',
  'js-core',
  'rxjs-core',
  'app-state',
  'ng-core',
  'ng-app-state',
  'ng-dev',
];

export function runCommand(command: string): void {
  execSync(command, { stdio: 'inherit' });
}

export function getInput(text: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = createInterface(process.stdin, process.stdout);
    reader.question(text, (answer) => {
      resolve(answer);
      reader.close();
    });
  });
}

export function copyEslintConfig() {
  copyFileSync(
    'projects/ng-dev/src/eslint-config.json',
    'dist/ng-dev/eslint-config.json',
  );
  copyFileSync(
    'projects/ng-dev/deprecated-config/.eslintrc.js',
    'dist/ng-dev/.eslintrc.js',
  );
  copyFileSync(
    'projects/ng-dev/deprecated-config/tslint.angularcli.json',
    'dist/ng-dev/tslint.angularcli.json',
  );
  copyFileSync(
    'projects/ng-dev/deprecated-config/tslint.json',
    'dist/ng-dev/tslint.json',
  );
}
