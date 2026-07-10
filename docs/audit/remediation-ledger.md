# Remediation Ledger

## RLS-001

| Field | Evidence |
|---|---|
| Finding | Authenticated users could read documents from unrelated tenants |
| Status | Remediated in synthetic reference version 1.0.0 |
| Baseline proof | `test/broken-baseline.test.js` against migration `0001` |
| Root cause | Document policy checked login state, not tenant membership |
| Change | Atomic migration `0002_enforce_tenant_membership.sql` |
| Regression proof | `test/rescued-tenant-isolation.test.js` |
| Rollback posture | Fail closed; never restore the vulnerable policy |

## Change applied

The remediation migration:

1. starts a transaction;
2. removes `authenticated_users_read_every_document`;
3. creates `authenticated_members_read_tenant_documents`;
4. matches `auth.uid()` and `documents.organization_id` against the membership
   relation; and
5. commits atomically.

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

Verified locally on 2026-07-10 with Node.js 24.16.0 and PGlite 0.5.4:

```text
RESCUE VERIFIED ... crossTenantProbesReturned:0
tests 2 | pass 2 | fail 0
```

The supported runtime remains Node.js 20 or newer; CI independently exercises
Node.js 20.

## Files reviewed

- `db/migrations/0001_broken_baseline.sql`
- `db/migrations/0002_enforce_tenant_membership.sql`
- `src/baseline-database.js`
- `src/rescued-database.js`
- `test/broken-baseline.test.js`
- `test/rescued-tenant-isolation.test.js`

## Residual work before production adaptation

This ledger closes only the demonstrated synthetic `SELECT` failure. A hosted
application still requires tests for write policies, JWT and PostgREST behavior,
membership lifecycle changes, privileged paths, database functions/views, and
the other boundaries listed in
[`docs/operations/residual-risks.md`](../operations/residual-risks.md).
