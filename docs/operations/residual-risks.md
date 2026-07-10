# Residual Risks and Explicit Limits

Version 1.0.0 remediates one synthetic authenticated `SELECT` leak. It is not a
complete authorization review or a production certification.

## Not covered by this proof

- Hosted Supabase Auth, JWT signature/claim validation, and session refresh.
- PostgREST routing, exposed schemas, views, RPC functions, or API caching.
- `INSERT`, `UPDATE`, `DELETE`, `UPSERT`, bulk import, and ownership transfer.
- Realtime subscriptions, Storage policies, Edge Functions, and webhooks.
- Service-role, database-owner, `BYPASSRLS`, or `SECURITY DEFINER` paths.
- Membership invitation, removal, role change, race, and stale-token behavior.
- Data already cached, exported, indexed, logged, or disclosed before a fix.
- Policy performance and query plans at production cardinality.
- Backup restoration, migration compatibility, observability, and incident
  communications in a real environment.
- Regulatory, privacy, compliance, penetration-test, or legal conclusions.

## PGlite boundary

PGlite exercises PostgreSQL roles, request settings, subqueries, transactions,
and RLS policies. It does not reproduce every hosted Supabase component or
configuration. A production adaptation must rerun equivalent role-accurate
tests against an authorized, non-production Supabase environment.

## Required next tests for a real application

1. Build a permission matrix for every role, tenant, table, operation, RPC, and
   storage bucket.
2. Execute positive and negative tests through the same API boundary used by
   clients, with real JWT validation but synthetic accounts/data.
3. Test direct primary-key filters, joins, views, RPCs, Realtime, and exports.
4. Test membership creation/removal and token refresh/revocation.
5. Inventory privileged keys and server code; confirm they never reach clients.
6. Load-test policy queries and inspect plans/index usage.
7. Exercise backup, forward repair, fail-closed containment, and monitoring.

## Assurance statement

A green local or CI run means only that the checked-in synthetic invariants held
for that revision. It does not prove that a separate application is secure.
