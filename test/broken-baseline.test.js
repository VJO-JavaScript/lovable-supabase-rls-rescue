import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createBrokenBaselineDatabase,
  FIXTURES,
  queryAs
} from '../src/baseline-database.js';

test('broken baseline reproduces an authenticated cross-tenant document read', async (t) => {
  const database = await createBrokenBaselineDatabase();
  t.after(async () => database.close());

  const anonymousDocuments = await queryAs(
    database,
    { role: 'anon' },
    'select id from public.documents order by id'
  );

  assert.equal(
    anonymousDocuments.rows.length,
    0,
    'RLS should keep documents private from anonymous requests'
  );

  const aliceMemberships = await queryAs(
    database,
    { role: 'authenticated', userId: FIXTURES.users.alice },
    `select organization_id
       from public.organization_memberships
      order by organization_id`
  );

  assert.deepEqual(
    aliceMemberships.rows.map((row) => row.organization_id),
    [FIXTURES.organizations.alpha],
    'Alice should belong to Alpha Company only'
  );

  const aliceDocuments = await queryAs(
    database,
    { role: 'authenticated', userId: FIXTURES.users.alice },
    `select id, organization_id, title
       from public.documents
      order by organization_id`
  );

  assert.equal(
    aliceDocuments.rows.length,
    2,
    'The vulnerable policy should expose both tenants to any authenticated user'
  );

  const alphaDocument = aliceDocuments.rows.find(
    (row) => row.id === FIXTURES.documents.alpha
  );
  const leakedBetaDocument = aliceDocuments.rows.find(
    (row) => row.id === FIXTURES.documents.beta
  );

  assert.ok(alphaDocument, 'Alice should retain access to her own tenant document');
  assert.ok(leakedBetaDocument, 'The reproduction must observe Beta data');
  assert.equal(leakedBetaDocument.organization_id, FIXTURES.organizations.beta);
  assert.notEqual(
    leakedBetaDocument.organization_id,
    aliceMemberships.rows[0].organization_id,
    'The observed Beta row must belong to a tenant Alice cannot access'
  );

  const evidence = {
    requestRole: 'authenticated',
    requestUser: FIXTURES.users.alice,
    authorizedTenant: FIXTURES.organizations.alpha,
    observedUnauthorizedTenant: leakedBetaDocument.organization_id,
    observedUnauthorizedDocument: leakedBetaDocument.title
  };

  console.log(`BROKEN BASELINE CONFIRMED ${JSON.stringify(evidence)}`);
});
