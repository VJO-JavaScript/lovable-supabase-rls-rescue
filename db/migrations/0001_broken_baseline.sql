-- INTENTIONALLY VULNERABLE, SYNTHETIC, AND LOCAL-ONLY.
-- Do not deploy this migration or copy its document policy into an application.

create role anon nologin;
create role authenticated nologin;

create schema auth;

create function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

comment on function auth.uid() is
  'Local Supabase-style request identity helper for synthetic tests only.';

create table public.organizations (
  id uuid primary key,
  name text not null unique
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations (id),
  user_id uuid not null,
  member_role text not null check (member_role in ('owner', 'member')),
  primary key (organization_id, user_id)
);

create table public.documents (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id),
  title text not null,
  body text not null
);

insert into public.organizations (id, name)
values
  ('11111111-1111-4111-8111-111111111111', 'Alpha Company'),
  ('22222222-2222-4222-8222-222222222222', 'Beta Company');

insert into public.organization_memberships (organization_id, user_id, member_role)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'owner'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'owner'
  );

insert into public.documents (id, organization_id, title, body)
values
  (
    'd1111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Alpha launch plan',
    'Synthetic confidential plan for Alpha Company.'
  ),
  (
    'd2222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'Beta pricing notes',
    'Synthetic confidential pricing for Beta Company.'
  );

alter table public.organization_memberships enable row level security;
alter table public.organization_memberships force row level security;

create policy "members_read_their_own_memberships"
on public.organization_memberships
for select
to authenticated
using (user_id = auth.uid());

alter table public.documents enable row level security;
alter table public.documents force row level security;

-- KNOWN VULNERABILITY: this checks authentication, not tenant membership.
create policy "authenticated_users_read_every_document"
on public.documents
for select
to authenticated
using (auth.uid() is not null);

create policy "anonymous_users_read_no_documents"
on public.documents
for select
to anon
using (false);

grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.documents to anon, authenticated;
grant select on public.organization_memberships to authenticated;
