# Repository Instructions

## Product goal

Provide honest, executable evidence that a Supabase-style tenant-isolation bug
can be reproduced, regression-tested, and later remediated without exposing
customer code or data.

## Architecture

- Node.js native test runner
- PGlite ephemeral PostgreSQL runtime
- SQL migrations under `db/migrations/`
- role/request-context adapter under `src/`
- deterministic security reproductions under `test/`

## Commands

```bash
npm install
npm test
npm run test:baseline
```

## Environment and secrets

The baseline requires no environment variables. `.env.example` contains names
only. Never add Supabase keys, JWTs, user data, or client source code.

## Database rules

- Migrations must remain deterministic and operate only on synthetic fixtures.
- Preserve the intentionally vulnerable policy for the `broken-baseline` tag.
- Never deploy the baseline migration.
- Tests must execute as realistic `anon` or `authenticated` roles rather than a
  superuser or service role that bypasses RLS.

## Deployment target

None. This is a local and CI evidence harness, not an application deployment.

## Verification checklist

- clean install succeeds on Node.js 20+
- `npm test` passes
- anonymous access returns zero documents
- Alice has only an Alpha Company membership
- the baseline visibly reproduces Alice reading Beta Company's document
- no secrets or real personal data are present

## Definition of done

The baseline is complete only when a clean local test emits reproducible leak
evidence and the documentation labels the repository as intentionally
vulnerable without claiming full Supabase equivalence.

## High-risk files

- `db/migrations/0001_broken_baseline.sql`: intentionally unsafe policy
- `src/baseline-database.js`: trusted role/request simulation boundary
- `test/broken-baseline.test.js`: evidence assertions must not be weakened
