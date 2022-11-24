import { copyEslintConfig } from './copy-eslint-config';
import { getInput, libraries, runCommand } from './shared';
import { join } from 'path';

async function run(): Promise<void> {
  copyEslintConfig();

  const otp = await getInput('Enter OTP: ');
  const extraArgs = process.argv.slice(2).join(' ');
  for (const project of libraries) {
    const path = join('dist', project);
    runCommand(`npm publish --access public --otp ${otp} ${extraArgs} ${path}`);
  }
}

run();
