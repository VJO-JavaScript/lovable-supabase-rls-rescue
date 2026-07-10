import { readFile } from 'node:fs/promises';

import { PGlite } from '@electric-sql/pglite';

export { FIXTURES, queryAs } from './baseline-database.js';

const migrationUrls = [
  new URL('../db/migrations/0001_broken_baseline.sql', import.meta.url),
  new URL('../db/migrations/0002_enforce_tenant_membership.sql', import.meta.url)
];

export async function createRescuedDatabase() {
  const database = new PGlite();

  for (const migrationUrl of migrationUrls) {
    const migration = await readFile(migrationUrl, 'utf8');
    await database.exec(migration);
  }

  return database;
}
