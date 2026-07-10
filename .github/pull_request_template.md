# Pull request

## What changed

Describe the smallest policy, fixture, test, or documentation change.

## Authorization evidence

- [ ] Assertions run as `anon` or `authenticated`, not a bypass role.
- [ ] Same-tenant behavior remains available where intended.
- [ ] Cross-tenant behavior is denied or affects zero rows.
- [ ] `npm run check` and `npm test` pass from a locked install.

## Safety and handoff

- [ ] Fixtures contain synthetic data only.
- [ ] No secret, private URL, customer data, or client code is included.
- [ ] Rollback and residual-risk documentation still matches the change.
