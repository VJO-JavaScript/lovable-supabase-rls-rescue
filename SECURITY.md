# Security Policy

## Intentionally vulnerable baseline

The cross-tenant document read described in the README is deliberate and uses
only synthetic data in an ephemeral local database. Please do not file a public
issue for that known baseline behavior.

Never point this harness at a real Supabase project, paste credentials into the
repository, or deploy `0001_broken_baseline.sql`.

## Reporting an unexpected vulnerability

For a security problem other than the documented baseline, use GitHub's private
vulnerability reporting feature for this repository. Do not include live
credentials, customer data, access tokens, or exploit data from systems you do
not own or lack permission to test.

Please include:

- the affected file and revision;
- a minimal reproduction using synthetic data;
- the expected and observed behavior; and
- the potential impact.

No production service is operated from this repository, so there is no hosted
deployment or customer data associated with the demonstration.
