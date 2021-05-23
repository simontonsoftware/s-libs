import { copyEslintConfig } from './copy-eslint-config';
import { getInput, libraries, runCommand } from './shared';

async function run(): Promise<void> {
  copyEslintConfig();

  const otp = await getInput('Enter OTP: ');
  const extraArgs = process.argv.slice(2).join(' ');
  for (const project of libraries) {
    runCommand(
      `npm publish --access public --otp ${otp} ${extraArgs} dist/${project}`,
    );
  }
}

run();
