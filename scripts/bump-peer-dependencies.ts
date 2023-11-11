import { readFileSync, writeFileSync } from 'fs';
import { format } from 'prettier';
import { libraries } from './shared';

run();

async function run(): Promise<void> {
  for (const project of libraries) {
    const path = `./projects/${project}/package.json`;
    const packageJson = JSON.parse(readFileSync(path).toString());
    const version = `^${packageJson.version}`;
    for (const dependency of libraries) {
      const key = `@s-libs/${dependency}`;
      if (packageJson.peerDependencies?.[key]) {
        packageJson.peerDependencies[key] = version;
      }
    }
    const text = await format(JSON.stringify(packageJson), { parser: 'json' });
    writeFileSync(path, text);
  }
}
