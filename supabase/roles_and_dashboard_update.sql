alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists status text not null default 'active',
  add column if not exists suspended_until timestamptz,
  add column if not exists balance numeric not null default 0,
  add column if not exists invested numeric not null default 0,
  add column if not exists returns numeric not null default 0,
  add column if not exists percentage_return numeric not null default 0,
  add column if not exists last_active timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.profiles
set
  role = coalesce(role, 'user'),
  status = coalesce(status, 'active'),
  balance = coalesce(balance, 0),
  invested = coalesce(invested, 0),
  returns = coalesce(returns, 0),
  percentage_return = coalesce(percentage_return, 0),
  updated_at = coalesce(updated_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'admin', 'superadmin'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_status_check
      check (status in ('active', 'suspended'));
  end if;
end $$;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'superadmin')
  )
);

drop policy if exists "profiles_update_admin_users" on public.profiles;
create policy "profiles_update_admin_users"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  and role = 'user'
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  and role = 'user'
);

drop policy if exists "profiles_update_superadmin_all" on public.profiles;
create policy "profiles_update_superadmin_all"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
  )
);
