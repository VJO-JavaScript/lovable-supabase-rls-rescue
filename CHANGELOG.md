# Changelog

All notable changes to this reference implementation are documented here.

## 1.1.0 - 2026-07-10

### Added in 1.1.0

- Tenant-scoped insert, update, and delete policies with explicit `WITH CHECK`
  protection against cross-tenant row moves.
- Role-accurate write regression matrix covering anonymous denial, same-tenant
  success, cross-tenant denial, and zero-row update/delete behavior.
- One-command evidence demo, CI job summary, PGlite boundary ADR, contribution
  guide, pull-request checklist, and private-reporting issue routing.

### Changed in 1.1.0

- Hardened runtime now applies migration `0003_enforce_tenant_writes.sql`.
- Residual-risk wording distinguishes tested PostgreSQL CRUD policy behavior
  from untested hosted Supabase boundaries.

## 1.0.0 - 2026-07-10

### Added in 1.0.0

- Preserved `broken-baseline` tag with a deterministic authenticated
  cross-tenant read reproduction.
- Atomic `0002` remediation requiring request identity and tenant membership.
- Anonymous, Alpha-user, Beta-user, and direct cross-tenant regression probes.
- CI, release consistency checks, remediation ledger, rollback runbook,
  residual-risk register, security policy, and public fit-check safety gate.

### Security

- Removed the permissive document policy from the hardened runtime.
- Added fail-closed recovery guidance; the vulnerable policy is never an
  approved rollback target.
