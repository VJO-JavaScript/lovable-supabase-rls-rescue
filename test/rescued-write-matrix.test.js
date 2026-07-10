import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createRescuedDatabase,
  FIXTURES,
  queryAs
} from '../src/rescued-database.js';

const ALICE = {
  role: 'authenticated',
  userId: FIXTURES.users.alice
};

const BOB = {
  role: 'authenticated',
  userId: FIXTURES.users.bob
};

test('rescued write policies enforce tenant membership and block tenant moves', async (t) => {
  const database = await createRescuedDatabase();
  t.after(async () => database.close());

  await assert.rejects(
    queryAs(
      database,
      { role: 'anon' },
      `insert into public.documents (id, organization_id, title, body)
       values ($1, $2, $3, $4)`,
      [
        'e0000000-0000-4000-8000-000000000001',
        FIXTURES.organizations.alpha,
        'Anonymous write',
        'This synthetic write must be denied.'
      ]
    ),
    /permission denied/u,
    'Anonymous callers must not receive document write privileges'
  );

  const aliceInsert = await queryAs(
    database,
    ALICE,
    `insert into public.documents (id, organization_id, title, body)
     values ($1, $2, $3, $4)
     returning organization_id`,
    [
      'e0000000-0000-4000-8000-000000000002',
      FIXTURES.organizations.alpha,
      'Alpha launch checklist',
      'Synthetic Alpha-only document.'
    ]
  );
  assert.equal(aliceInsert.rows[0].organization_id, FIXTURES.organizations.alpha);

  await assert.rejects(
    queryAs(
      database,
      ALICE,
      `insert into public.documents (id, organization_id, title, body)
       values ($1, $2, $3, $4)`,
      [
        'e0000000-0000-4000-8000-000000000003',
        FIXTURES.organizations.beta,
        'Cross-tenant insert',
        'This synthetic write must be denied.'
      ]
    ),
    /row-level security policy/u,
    'Alice must not insert a document into Beta'
  );

  const aliceOwnUpdate = await queryAs(
    database,
    ALICE,
    `update public.documents
     set title = 'Alpha launch plan reviewed'
     where id = $1
     returning id`,
    [FIXTURES.documents.alpha]
  );
  assert.deepEqual(aliceOwnUpdate.rows, [{ id: FIXTURES.documents.alpha }]);

  const aliceBetaUpdate = await queryAs(
    database,
    ALICE,
    `update public.documents
     set title = 'Unauthorized edit'
     where id = $1
     returning id`,
    [FIXTURES.documents.beta]
  );
  assert.deepEqual(
    aliceBetaUpdate.rows,
    [],
    'A cross-tenant update must affect zero rows'
  );

  await assert.rejects(
    queryAs(
      database,
      ALICE,
      `update public.documents
       set organization_id = $1
       where id = $2`,
      [FIXTURES.organizations.beta, FIXTURES.documents.alpha]
    ),
    /row-level security policy/u,
    'WITH CHECK must prevent Alice moving an Alpha row into Beta'
  );

  const aliceBetaDelete = await queryAs(
    database,
    ALICE,
    'delete from public.documents where id = $1 returning id',
    [FIXTURES.documents.beta]
  );
  assert.deepEqual(
    aliceBetaDelete.rows,
    [],
    'A cross-tenant delete must affect zero rows'
  );

  const bobInsert = await queryAs(
    database,
    BOB,
    `insert into public.documents (id, organization_id, title, body)
     values ($1, $2, $3, $4)
     returning organization_id`,
    [
      'e0000000-0000-4000-8000-000000000004',
      FIXTURES.organizations.beta,
      'Beta launch checklist',
      'Synthetic Beta-only document.'
    ]
  );
  assert.equal(bobInsert.rows[0].organization_id, FIXTURES.organizations.beta);

  console.log(
    `WRITE MATRIX VERIFIED ${JSON.stringify({
      anonymousWrite: 'denied',
      sameTenantInsert: 'allowed',
      crossTenantInsert: 'denied',
      sameTenantUpdate: 'allowed',
      crossTenantUpdateRows: 0,
      tenantMove: 'denied',
      crossTenantDeleteRows: 0
    })}`
  );
});
