# Baseline Finding: Authenticated Cross-Tenant Read

## Finding record

| Field | Value |
|---|---|
| Identifier | RLS-001 |
| Category | Broken access control / tenant isolation |
| Baseline | `broken-baseline` Git tag |
| Data | Deterministic synthetic fixtures only |
| Impact in fixture | Alpha user reads Beta private document |
| Production claim | None |

## Authorization invariant

An authenticated user may read a document only when that user has a membership
whose `organization_id` equals the document's `organization_id`.

## Synthetic actors and records

| Actor | Request role | Authorized tenant | Expected document |
|---|---|---|---|
| Anonymous visitor | `anon` | None | None |
| Alice | `authenticated` | Alpha Company | Alpha launch plan |
| Bob | `authenticated` | Beta Company | Beta pricing notes |

## Reproduction

```bash
npm ci
npm run test:baseline
```

The test verifies that anonymous requests read no documents and that Alice can
see only the Alpha membership. It then queries documents in Alice's
authenticated request context.

### Expected

Alice receives the Alpha document only.

### Observed

Alice receives both Alpha and Beta documents:

```text
BROKEN BASELINE CONFIRMED ...
observedUnauthorizedTenant:"22222222-2222-4222-8222-222222222222"
observedUnauthorizedDocument:"Beta pricing notes"
```

## Root cause

The baseline document policy evaluates only `auth.uid() is not null`. That
separates anonymous from authenticated requests but gives every authenticated
identity access to every tenant's document. The membership relation exists but
is absent from the document authorization decision.

## Evidence integrity

- Migrations and fixture setup execute as the ephemeral database owner.
- All access assertions execute through the allowlisted `anon` or
  `authenticated` role.
- The JWT subject is parameterized and transaction-local.
- Each request rolls back, preventing identity or role leakage between probes.
- No service role, real identity, credential, client system, or external
  database is used.

## Limitations

This finding proves PostgreSQL RLS behavior in PGlite. It does not test hosted
Supabase Auth, JWT verification, PostgREST, network controls, Realtime, Storage,
Edge Functions, write policies, or production data. It must not be represented
as a customer incident or a complete security audit.
