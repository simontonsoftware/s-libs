import { execSync } from 'child_process';
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
