import { copyFileSync } from 'fs';
import { getInput, libraries, runCommand } from './shared';

const ngDevExtraFiles = [
  'tslint.angularcli.json',
  'tslint.json',
  '.eslintrc.js',
];

async function run(): Promise<void> {
  const extraArgs = process.argv.slice(2).join(' ');

  for (const file of ngDevExtraFiles) {
    copyFileSync(file, `dist/ng-dev/${file}`);
  }

  const otp = await getInput('Enter OTP: ');
  for (const project of libraries) {
    runCommand(
      `npm publish --access public --otp ${otp} ${extraArgs} dist/${project}`,
    );
  }
}

run();
