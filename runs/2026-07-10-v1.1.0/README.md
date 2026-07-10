# Version 1.1.0 verification

The portable evidence harness passed a clean locked install, source/version
checks, three role-accurate tests, and the one-command demonstration.

```text
PROJECT CHECK PASSED version=1.1.0 environment_values=empty
BROKEN BASELINE CONFIRMED ...
RESCUE VERIFIED ... crossTenantProbesReturned:0
WRITE MATRIX VERIFIED ... tenantMove:"denied"
tests 3 | pass 3 | fail 0
DEMO COMPLETE: baseline reproduced; hardened invariants passed.
```

This run verifies checked-in synthetic PostgreSQL policy behavior only. Hosted
Supabase and production boundaries remain explicitly out of scope.
