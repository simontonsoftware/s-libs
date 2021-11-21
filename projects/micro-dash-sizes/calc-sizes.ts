import { isDefined } from '@s-libs/js-core';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { writeFileSync } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as readline from 'readline';
import { explore } from 'source-map-explorer';
import { forEach } from '../micro-dash/src/lib/collection';

const rootDir = path.join(__dirname, '..', '..');
const mainDir = path.join(__dirname, 'src');
const appDir = path.join(mainDir, 'app');
const bundleDir = path.join(rootDir, 'dist', 'micro-dash-sizes');
const sourceDir = path.join(rootDir, 'projects', 'micro-dash', 'src', 'lib');

run();

async function run(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const base = await getFileBaseInput();
    const library = await getLibraryInput();
    if (library !== 'lodash') {
      console.log('rebuilding micro-dash ...');
      execSync('ng build micro-dash', { cwd: rootDir });
    }
    await buildAndExplore(`**/${base}.${library}.ts`);
  }
}

async function getFileBaseInput(): Promise<string> {
  let base = await getInput(
    'Filename base (e.g. "map-values"), or "all" for all: ',
  );
  if (base === 'all') {
    base = '*';
  }
  return base;
}

async function getLibraryInput(): Promise<string> {
  let library = await getInput(
    'Which libraries ("m" for microdash, "l" for lodash, "ml" for both): ',
  );
  if (library.includes('m') && library.includes('l')) {
    library = '*';
  } else if (library.includes('l')) {
    library = 'lodash';
  } else {
    library = 'microdash';
  }
  return library;
}

async function getInput(text: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = readline.createInterface(process.stdin, process.stdout);
    reader.question(text, (answer) => {
      resolve(answer);
      reader.close();
    });
  });
}

async function buildAndExplore(fileGlob: string): Promise<void> {
  const inputPaths = await getPaths(fileGlob);
  for (const inputPath of inputPaths) {
    build(inputPath);
    const summary = await inspect();
    if (isDefined(summary)) {
      updateComment(inputPath, summary);
    }
  }
}

async function getPaths(fileGlob: string): Promise<string[]> {
  return new Promise<string[]>((resolve) => {
    glob(path.join(appDir, fileGlob), { nodir: true }, (_err, files) => {
      resolve(files);
    });
  });
}

function build(inputPath: string): void {
  const importFile = path.relative(mainDir, inputPath);
  const importPath = './' + importFile.replace(/\\/gu, '/').replace('.ts', '');

  // lodash files come first, so print only on those
  const lodashIndex = importPath.indexOf('.lodash');
  if (lodashIndex > 0) {
    console.log(importPath.substr(0, lodashIndex));
  }

  writeFileSync(path.join(mainDir, 'main.ts'), `import "${importPath}";`);
  execSync('ng build --sourceMap=true micro-dash-sizes', { cwd: rootDir });
}

async function inspect(): Promise<string | undefined> {
  const res = await explore(path.join(bundleDir, 'main.*.js'));

  let lodash = 0;
  let microdash = 0;
  forEach(res.bundles[0].files, ({ size }, sourceFile) => {
    if (sourceFile.includes('lodash')) {
      lodash += size;
    } else if (sourceFile.includes('micro-dash')) {
      microdash += size;
    }
  });
  let summary: string | undefined;
  if (lodash > 0) {
    summary = ` * - Lodash: ${lodash.toLocaleString()} bytes`;
  } else if (microdash > 0) {
    summary = ` * - Micro-dash: ${microdash.toLocaleString()} bytes`;
  }
  console.log(summary);
  return summary;
}

function updateComment(inputPath: string, summary: string): void {
  const { lib } = / - (?<lib>.*):/u.exec(summary)!.groups!;

  const relativePath = path.relative(appDir, inputPath);
  const baseName = relativePath.replace(/\.lodash|\.microdash/u, '');
  const sourcePath = path.join(sourceDir, baseName);

  let source = fs.readFileSync(sourcePath, 'utf8');
  source = source.replace(new RegExp(` \\* - ${lib}:.*`, 'u'), summary);
  fs.writeFileSync(sourcePath, source);
}
