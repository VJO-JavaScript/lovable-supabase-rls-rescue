# Rollback and Recovery Runbook

## Safety rule

**Never roll back to the `broken-baseline` policy.** Restoring
`auth.uid() is not null` would knowingly reopen cross-tenant reads. Prefer a
forward repair. If correctness cannot be established, fail closed.

This is a reference runbook for the synthetic repository, not an instruction to
change a production database without authorization, backups, review, and a
maintenance plan.

## Preconditions for a real adaptation

1. Stop automated migrations and record the application/database revisions.
2. Confirm an authorized operator, maintenance window, and communication owner.
3. Capture a restorable database backup and test its recovery procedure.
4. Reproduce the failure in staging with synthetic tenant identities.
5. Record active policies, grants, functions, views, and service-role consumers.

## Preferred recovery: forward repair

If the membership policy causes an outage, inspect the failing role, JWT subject,
membership row, query plan, and policy catalog in staging. Correct the policy or
membership lifecycle in a new migration, then rerun the anonymous, Alice, Bob,
and direct cross-tenant probes before promotion.

Do not edit an already-applied migration or weaken the policy merely to restore
traffic.

## Emergency containment: fail closed

When unauthorized disclosure is possible and a forward fix is not ready,
disable authenticated document reads rather than restore the known-vulnerable
policy. The following pattern is intentionally availability-impacting and must
be adapted and reviewed for the target environment:

```sql
begin;
drop policy if exists "authenticated_members_read_tenant_documents"
  on public.documents;
revoke select on public.documents from authenticated;
commit;
```

This removes the demonstrated read path. It is not a complete incident response;
privileged functions, views, APIs, caches, exports, and service-role consumers
must be assessed separately.

## Restore service

1. Apply a reviewed forward migration that reinstates tenant authorization.
2. Restore the minimum required grant to `authenticated`.
3. Verify anonymous access returns zero rows.
4. Verify Alice can read Alpha and cannot read Beta by list and direct-ID probes.
5. Verify Bob can read Beta and cannot read Alpha by list and direct-ID probes.
6. Test every relevant write operation and privileged integration in staging.
7. Monitor authorization failures and unexpected row counts after release.

## Stop conditions

Do not promote or restore traffic if any cross-tenant probe returns a row, the
request identity cannot be proven, a service/admin credential appears in an
acceptance assertion, the backup cannot be restored, or policy/grant inventory
is incomplete.
