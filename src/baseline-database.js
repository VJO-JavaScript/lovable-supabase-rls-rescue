import { readFile } from 'node:fs/promises';

import { PGlite } from '@electric-sql/pglite';

const ALLOWED_ROLES = new Set(['anon', 'authenticated']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FIXTURES = Object.freeze({
  users: Object.freeze({
    alice: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    bob: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  }),
  organizations: Object.freeze({
    alpha: '11111111-1111-4111-8111-111111111111',
    beta: '22222222-2222-4222-8222-222222222222'
  }),
  documents: Object.freeze({
    alpha: 'd1111111-1111-4111-8111-111111111111',
    beta: 'd2222222-2222-4222-8222-222222222222'
  })
});

const migrationUrl = new URL(
  '../db/migrations/0001_broken_baseline.sql',
  import.meta.url
);

export async function createBrokenBaselineDatabase() {
  const database = new PGlite();
  const migration = await readFile(migrationUrl, 'utf8');
  await database.exec(migration);
  return database;
}

/**
 * Execute one query under a synthetic Supabase request context.
 *
 * The role is selected from a hard-coded allowlist before interpolation. The
 * JWT subject is passed as a query parameter and stored only for the current
 * transaction. A rollback guarantees that identity and role state cannot leak
 * into the next test request.
 */
export async function queryAs(
  database,
  { role, userId = null },
  sql,
  params = []
) {
  if (!ALLOWED_ROLES.has(role)) {
    throw new TypeError(`Unsupported request role: ${role}`);
  }

  if (role === 'authenticated' && !UUID_PATTERN.test(userId ?? '')) {
    throw new TypeError('Authenticated requests require a valid UUID userId.');
  }

  if (role === 'anon' && userId !== null) {
    throw new TypeError('Anonymous requests cannot include a userId.');
  }

  await database.exec('begin');

  try {
    await database.query(
      "select set_config('request.jwt.claim.sub', $1, true)",
      [userId ?? '']
    );
    await database.exec(`set local role ${role}`);
    const result = await database.query(sql, params);
    await database.exec('rollback');
    return result;
  } catch (error) {
    try {
      await database.exec('rollback');
    } catch {
      // Preserve the original query error if the transaction is already gone.
    }
    throw error;
  }
}
