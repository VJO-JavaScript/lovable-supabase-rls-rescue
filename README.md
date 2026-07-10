# Lovable + Supabase RLS Rescue Proof

> [!CAUTION]
> This repository's baseline is **intentionally vulnerable**. It exists to
> reproduce a cross-tenant data leak with synthetic data. Do not deploy this
> migration, copy its policy into an application, or connect this harness to a
> real Supabase project.

This small evidence repository models a common launch blocker in AI-built SaaS
applications: a Row Level Security (RLS) policy confirms that a user is logged
in but never confirms that the user belongs to the row's tenant.

The baseline test proves the failure before any remediation is attempted:

- an `anon` request reads no documents;
- authenticated Alice has membership in Alpha Company only;
- Alice can correctly read Alpha Company's document; and
- Alice can **incorrectly read Beta Company's document**.

Everything runs locally in an ephemeral PGlite database. All identities,
organizations, and documents are synthetic and deterministic.

## Run the reproduction

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
```

The successful test output includes `BROKEN BASELINE CONFIRMED`. Here,
"successful" means that the test deterministically observed the intended
security failure. It does **not** mean the policy is safe.

No environment variables, Docker daemon, hosted database, or Supabase account
are required. `.env.example` contains names only for a possible future hosted
staging adapter; this baseline never reads them.

## Why the policy is broken

The intentionally vulnerable policy in
[`db/migrations/0001_broken_baseline.sql`](db/migrations/0001_broken_baseline.sql)
is equivalent to:

```sql
using (auth.uid() is not null)
```

That expression distinguishes authenticated users from anonymous users, but it
authorizes every authenticated user to read every tenant's row. Authentication
is not tenant authorization.

## What this harness models

- PostgreSQL roles named `anon` and `authenticated`.
- A Supabase-style `auth.uid()` derived from the request JWT subject setting.
- Two organizations, two users, one membership per user, and one private
  document per organization.
- PostgreSQL RLS evaluated while queries execute as the request role.

PGlite exercises real PostgreSQL policy behavior, but this is not a complete
Supabase emulator. It does not test the hosted Auth service, JWT verification,
PostgREST's HTTP layer, network configuration, or a production migration path.
Those boundaries are intentionally stated so the evidence is not oversold.

## Evidence and safety

- [Baseline evidence](docs/broken-baseline-evidence.md)
- [Security policy](SECURITY.md)
- [Synthetic migration](db/migrations/0001_broken_baseline.sql)
- [Deterministic test](test/broken-baseline.test.js)

The vulnerable state should be preserved in a `broken-baseline` Git tag for
comparison with a separately reviewed remediation. The vulnerable baseline
must never be deployed.

## License

MIT
