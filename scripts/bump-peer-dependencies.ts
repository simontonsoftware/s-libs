import { readFileSync, writeFileSync } from 'fs';
import { format } from 'prettier';
import { libraries } from './shared';

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
  writeFileSync(path, format(JSON.stringify(packageJson), { parser: 'json' }));
}
