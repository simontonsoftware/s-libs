import { copyFileSync, mkdirSync, readdirSync, rmdirSync } from 'fs';
import { join } from 'path';

export function copyEslintConfig() {
  const targetFolder = 'dist/eslint-config-ng';
  rmdirSync(targetFolder, { recursive: true });
  mkdirSync(targetFolder);

  const srcFolder = 'projects/eslint-config-ng';
  for (const file of readdirSync(srcFolder)) {
    copyFileSync(join(srcFolder, file), join(targetFolder, file));
  }

  // deprecated config
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
