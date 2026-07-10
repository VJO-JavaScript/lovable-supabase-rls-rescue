# Broken Baseline Evidence

## Finding

**Authenticated cross-tenant document disclosure**

Category: Broken access control / tenant-isolation failure

Environment: Ephemeral local PGlite with synthetic fixtures
Baseline status: Intentionally vulnerable

## Authorization invariant

An authenticated user may read a document only when that user has a membership
for the document's `organization_id`.

## Synthetic actors and records

| Actor | Request role | Authorized tenant | Document expected |
|---|---|---|---|
| Anonymous visitor | `anon` | None | None |
| Alice | `authenticated` | Alpha Company | Alpha launch plan |
| Bob | `authenticated` | Beta Company | Beta pricing notes |

## Deterministic reproduction

```bash
npm install
npm run test:baseline
```

The test first verifies that anonymous requests read no documents. It then
verifies that Alice has exactly one visible membership, for Alpha Company.
Finally, it queries documents under Alice's authenticated request context.

### Expected

Alice receives the Alpha document only.

### Observed in the broken baseline

Alice receives both the Alpha and Beta documents. The test prints a structured
`BROKEN BASELINE CONFIRMED` evidence line naming the authorized tenant and the
unauthorized tenant observed.

## Root cause

The document policy asks only whether `auth.uid()` is non-null. It authenticates
the request without checking whether that identity belongs to the row's tenant.

## Scope and limitations

This evidence validates PostgreSQL role and RLS behavior in a local PGlite
runtime. It does not validate Supabase Auth, token signatures, PostgREST, network
controls, hosted configuration, or production data. No client system, real user,
real credential, or external service is involved.

Remediation is intentionally absent from this baseline. The unsafe state should
be preserved as a comparison tag and never deployed.
