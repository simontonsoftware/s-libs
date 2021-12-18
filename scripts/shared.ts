import { execSync } from 'child_process';
import { createInterface } from 'readline';

// in dependency order
export const buildableLibraries = [
  'micro-dash',
  'js-core',
  'rxjs-core',
  'app-state',
  'ng-core',
  'ng-app-state',
  'ng-mat-core',
  'ng-dev',
];

export const libraries = [...buildableLibraries, 'eslint-config-ng'];

export function runCommand(command: string): void {
  execSync(command, { stdio: 'inherit' });
}

export async function getInput(text: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = createInterface(process.stdin, process.stdout);
    reader.question(text, (answer) => {
      resolve(answer);
      reader.close();
    });
  });
}
