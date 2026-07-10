# Security Policy

## Supported state

| Revision | Status |
|---|---|
| `main` / version 1.x | Supported synthetic reference |
| `broken-baseline` tag | Intentionally vulnerable; never deploy |

The preserved baseline's cross-tenant document read is deliberate and uses only
synthetic data in an ephemeral local database. Do not file a vulnerability
report for that documented historical behavior.

Neither revision is a hosted service or drop-in production migration. Never
point the harness at a real Supabase project, paste credentials into the
repository, or deploy the vulnerable `0001` migration by itself.

## Report an unexpected vulnerability privately

Use GitHub's **Security > Report a vulnerability** private reporting flow for
this repository. Do not open a public issue or public fit-check for a security
report.

Do not include live credentials, customer/personal data, private repository or
staging URLs, proprietary code, or exploit data from systems you do not own or
lack permission to test. Use synthetic values and include:

- the affected file and revision;
- a minimal authorized reproduction;
- expected and observed behavior; and
- potential impact.

This repository operates no production service and holds no customer data, so
there is no uptime or emergency-response channel associated with it.

## Public fit checks

The public issue form is for redacted scope questions only. Every issue and
response is public. Secrets, private URLs, credentials, real user/customer data,
private source, and unauthorized exploit details are forbidden.
