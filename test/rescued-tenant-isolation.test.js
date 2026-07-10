import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createRescuedDatabase,
  FIXTURES,
  queryAs
} from '../src/rescued-database.js';

async function visibleDocumentIds(database, request) {
  const result = await queryAs(
    database,
    request,
    'select id from public.documents order by id'
  );

  return result.rows.map((row) => row.id);
}

test('rescued policy preserves anonymous privacy and isolates both tenants', async (t) => {
  const database = await createRescuedDatabase();
  t.after(async () => database.close());

  const anonymousDocumentIds = await visibleDocumentIds(database, {
    role: 'anon'
  });
  assert.deepEqual(
    anonymousDocumentIds,
    [],
    'Anonymous requests must not read private tenant documents'
  );

  const aliceRequest = {
    role: 'authenticated',
    userId: FIXTURES.users.alice
  };
  const aliceIdentity = await queryAs(
    database,
    aliceRequest,
    'select auth.uid() as user_id'
  );
  assert.equal(aliceIdentity.rows[0].user_id, FIXTURES.users.alice);
  assert.deepEqual(
    await visibleDocumentIds(database, aliceRequest),
    [FIXTURES.documents.alpha],
    'Alice must see only the Alpha Company document'
  );

  const aliceBetaProbe = await queryAs(
    database,
    aliceRequest,
    'select id from public.documents where organization_id = $1',
    [FIXTURES.organizations.beta]
  );
  assert.deepEqual(
    aliceBetaProbe.rows,
    [],
    'A direct Beta tenant filter must not bypass Alice\'s RLS policy'
  );

  const bobRequest = {
    role: 'authenticated',
    userId: FIXTURES.users.bob
  };
  const bobIdentity = await queryAs(
    database,
    bobRequest,
    'select auth.uid() as user_id'
  );
  assert.equal(bobIdentity.rows[0].user_id, FIXTURES.users.bob);
  assert.deepEqual(
    await visibleDocumentIds(database, bobRequest),
    [FIXTURES.documents.beta],
    'Bob must see only the Beta Company document'
  );

  const bobAlphaProbe = await queryAs(
    database,
    bobRequest,
    'select id from public.documents where organization_id = $1',
    [FIXTURES.organizations.alpha]
  );
  assert.deepEqual(
    bobAlphaProbe.rows,
    [],
    'A direct Alpha tenant filter must not bypass Bob\'s RLS policy'
  );

  console.log(
    `RESCUE VERIFIED ${JSON.stringify({
      anonVisibleDocuments: anonymousDocumentIds.length,
      aliceVisibleDocuments: [FIXTURES.documents.alpha],
      bobVisibleDocuments: [FIXTURES.documents.beta],
      crossTenantProbesReturned: 0
    })}`
  );
});
