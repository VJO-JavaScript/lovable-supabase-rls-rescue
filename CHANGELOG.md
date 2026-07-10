# Changelog

All notable changes to this reference implementation are documented here.

## 1.0.0 - 2026-07-10

### Added

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
