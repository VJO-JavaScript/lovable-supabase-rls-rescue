import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const packageLock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const versionFile = (await readFile('VERSION', 'utf8')).trim();
const envExample = await readFile('.env.example', 'utf8');

assert.equal(packageJson.version, versionFile, 'package.json and VERSION differ');
assert.equal(packageLock.version, versionFile, 'package-lock.json and VERSION differ');
assert.equal(
  packageLock.packages[''].version,
  versionFile,
  'package-lock.json root package and VERSION differ'
);

for (const [lineNumber, line] of envExample.split(/\r?\n/u).entries()) {
  if (!line || line.startsWith('#')) {
    continue;
  }

  assert.match(line, /^[A-Z][A-Z0-9_]*=$/u, `.env.example line ${lineNumber + 1} must be name-only`);
}

console.log(`PROJECT CHECK PASSED version=${versionFile} environment_values=empty`);
