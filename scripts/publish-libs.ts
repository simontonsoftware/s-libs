import { copyFileSync } from 'fs';
import { getInput, libraries, runCommand } from './shared';

const ngDevExtraFiles = [
  'tslint.angularcli.json',
  'tslint.json',
  '.eslintrc.js',
];

async function run(): Promise<void> {
  for (const file of ngDevExtraFiles) {
    copyFileSync(file, `dist/ng-dev/${file}`);
  }

  const otp = await getInput('Enter OTP: ');
  for (const project of libraries) {
    runCommand(`npm publish dist/${project} --otp ${otp}`);
  }
}

run();
