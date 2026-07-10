-- Harden document reads by authorizing the request identity against the row's
-- organization membership. Apply only after 0001_broken_baseline.sql.

begin;

drop policy if exists "authenticated_users_read_every_document"
on public.documents;

create policy "authenticated_members_read_tenant_documents"
on public.documents
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = documents.organization_id
      and membership.user_id = auth.uid()
  )
);

comment on policy "authenticated_members_read_tenant_documents"
on public.documents is
  'Restricts document reads to the authenticated user''s organization memberships.';

commit;
