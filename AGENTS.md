# Repository Instructions

## Product goal

Provide honest, executable evidence that a Supabase-style tenant-isolation bug
can be reproduced, regression-tested, remediated, and recovered without client
code, credentials, or real data.

## Architecture

- Node.js native test runner
- PGlite ephemeral PostgreSQL runtime
- ordered SQL migrations under `db/migrations/`
- role/request-context adapters under `src/`
- deterministic before/after security tests under `test/`
- audit, rollback, residual-risk, and run evidence under `docs/` and `runs/`

## Commands

```bash
npm ci
npm run check
npm test
npm run test:baseline
npm run test:rescued
```

## Environment and secrets

No environment variables are required. `.env.example` must contain names only.
Never add Supabase keys, JWTs, user/customer data, private URLs, or client code.

## Database and migration rules

- Migrations must be ordered, deterministic, and limited to synthetic fixtures.
- Preserve the `broken-baseline` tag; never weaken or rewrite its history.
- Never deploy `0001_broken_baseline.sql` by itself.
- New remediation must be a forward migration and atomic where practical.
- Never restore the vulnerable policy as a rollback.
- Access assertions must execute as realistic `anon` or `authenticated` roles,
  not as a database owner, service role, or `BYPASSRLS` role.
- Privileged setup may create the synthetic schema and fixtures only.

## Deployment target

None. This is a local and CI evidence harness, not an application deployment.

## Verification checklist

- `npm ci` completes from the lockfile
- `npm run check` validates syntax, versions, and blank environment values
- the preserved baseline visibly reproduces Alice reading Beta
- anonymous access returns zero documents before and after remediation
- rescued Alice sees Alpha only and direct Beta probes return zero rows
- rescued Bob sees Beta only and direct Alpha probes return zero rows
- no service/admin role is used in an authorization assertion
- public docs disclose synthetic reference work and residual risk
- no secrets or real personal/customer data are present

## Definition of done

A change is complete only when the clean locked install, checks, complete test
suite, evidence documentation, rollback posture, and residual-risk statement
agree. A passing local test must never be represented as production assurance.

## High-risk files

- `db/migrations/0001_broken_baseline.sql`: intentionally unsafe historical policy
- `db/migrations/0002_enforce_tenant_membership.sql`: hardened authorization decision
- `src/baseline-database.js`: trusted role/request simulation boundary
- `test/*.test.js`: evidence assertions must not be weakened
- `docs/operations/rollback-runbook.md`: rollback must remain fail closed
