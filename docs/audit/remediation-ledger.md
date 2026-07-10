# Remediation Ledger

## RLS-001

| Field | Evidence |
|---|---|
| Finding | Authenticated users could read documents from unrelated tenants |
| Status | Read fix in version 1.0.0; write matrix added in 1.1.0 |
| Baseline proof | `test/broken-baseline.test.js` against migration `0001` |
| Root cause | Document policy checked login state, not tenant membership |
| Change | Atomic read migration `0002` plus tenant-write migration `0003` |
| Regression proof | Read isolation and write-matrix tests under `test/` |
| Rollback posture | Fail closed; never restore the vulnerable policy |

## Change applied

The remediation migrations:

1. starts a transaction;
2. removes `authenticated_users_read_every_document`;
3. creates `authenticated_members_read_tenant_documents`;
4. matches `auth.uid()` and `documents.organization_id` against the membership
   relation; and
5. commit atomically; and
6. add insert, update, and delete policies that require tenant membership,
   including an update `WITH CHECK` against the post-update organization.

The existing primary key on `(organization_id, user_id)` supports the membership
lookup. The membership table retains its own policy limiting authenticated users
to their own membership rows.

## Acceptance evidence

All assertions below execute as request roles, never as the database owner or a
service role:

| Probe | Required result | Verified result |
|---|---:|---:|
| Anonymous lists documents | 0 | 0 |
| Alice lists documents | Alpha only | Alpha only |
| Alice filters directly for Beta | 0 | 0 |
| Bob lists documents | Beta only | Beta only |
| Bob filters directly for Alpha | 0 | 0 |
| `auth.uid()` for Alice/Bob | Fixture UUID | Fixture UUID |
| Anonymous inserts a document | Permission denied | Permission denied |
| Alice inserts/updates Alpha | Allowed | Allowed |
| Alice inserts into Beta | Denied | Denied |
| Alice moves Alpha row to Beta | Denied | Denied |
| Alice updates/deletes Beta | 0 rows | 0 rows |
| Bob inserts into Beta | Allowed | Allowed |

Verified locally on 2026-07-10 with Node.js 24.16.0 and PGlite 0.5.4:

```text
RESCUE VERIFIED ... crossTenantProbesReturned:0
WRITE MATRIX VERIFIED ... tenantMove:"denied"
tests 3 | pass 3 | fail 0
```

The supported runtime remains Node.js 20 or newer; CI independently exercises
Node.js 20.

## Files reviewed

- `db/migrations/0001_broken_baseline.sql`
- `db/migrations/0002_enforce_tenant_membership.sql`
- `db/migrations/0003_enforce_tenant_writes.sql`
- `src/baseline-database.js`
- `src/rescued-database.js`
- `test/broken-baseline.test.js`
- `test/rescued-tenant-isolation.test.js`
- `test/rescued-write-matrix.test.js`

## Residual work before production adaptation

This ledger closes the demonstrated synthetic `SELECT` failure and the checked
document CRUD matrix. A hosted application still requires equivalent API-level
tests, JWT and PostgREST behavior, write policies on every other table,
membership lifecycle changes, privileged paths, database functions/views, and
the other boundaries listed in
[`docs/operations/residual-risks.md`](../operations/residual-risks.md).
