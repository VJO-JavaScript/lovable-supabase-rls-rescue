# Contributing

This repository is a deliberately small evidence harness. Changes should make
the authorization claim easier to reproduce or harder to misinterpret.

## Local verification

```bash
npm ci
npm run check
npm test
```

## Pull-request expectations

- Add or update a role-accurate test for every policy change.
- Keep fixture data synthetic and deterministic.
- Never weaken the preserved `broken-baseline` history.
- Never use a service/admin role for an authorization assertion.
- Update the remediation ledger, rollback posture, and residual risks when the
  tested boundary changes.
- Do not commit credentials, private URLs, customer data, or client code.

Unexpected vulnerabilities should use GitHub private vulnerability reporting,
not a public issue.
