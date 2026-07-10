-- Extend the hardened read boundary to tenant-scoped document writes.
-- Apply only after 0002_enforce_tenant_membership.sql.

begin;

create policy "authenticated_members_insert_tenant_documents"
on public.documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = documents.organization_id
      and membership.user_id = auth.uid()
  )
);

create policy "authenticated_members_update_tenant_documents"
on public.documents
for update
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = documents.organization_id
      and membership.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = documents.organization_id
      and membership.user_id = auth.uid()
  )
);

create policy "authenticated_members_delete_tenant_documents"
on public.documents
for delete
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = documents.organization_id
      and membership.user_id = auth.uid()
  )
);

grant insert, update, delete on public.documents to authenticated;

comment on policy "authenticated_members_insert_tenant_documents"
on public.documents is
  'Allows document creation only inside an organization belonging to auth.uid().';

comment on policy "authenticated_members_update_tenant_documents"
on public.documents is
  'Requires membership for both the existing row and its post-update organization.';

comment on policy "authenticated_members_delete_tenant_documents"
on public.documents is
  'Allows document deletion only inside an organization belonging to auth.uid().';

commit;
