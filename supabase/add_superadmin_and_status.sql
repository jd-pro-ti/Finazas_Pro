do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and e.enumlabel = 'superadmin'
  ) then
    alter type public.user_role add value 'superadmin';
  end if;
end $$;

alter table public.profiles
  add column if not exists status text not null default 'active',
  add column if not exists suspended_until timestamptz,
  add column if not exists last_active timestamptz;

update public.profiles
set status = coalesce(status, 'active');

do $$
begin
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
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists portfolio_user_id_idx on public.portfolio (user_id);
create index if not exists system_logs_user_id_idx on public.system_logs (user_id);

update public.profiles
set
  role = 'superadmin',
  status = 'active',
  suspended_until = null
where email = 'jdchavezr917@gmail.com'
  and role = 'admin';

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.portfolio enable row level security;
alter table public.system_logs enable row level security;

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

drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_basic"
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
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  and role in ('user', 'admin')
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

drop policy if exists "transactions_select_own_or_admin" on public.transactions;
create policy "transactions_select_own_or_admin"
on public.transactions
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'superadmin')
  )
);

drop policy if exists "portfolio_select_own_or_admin" on public.portfolio;
create policy "portfolio_select_own_or_admin"
on public.portfolio
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'superadmin')
  )
);

drop policy if exists "system_logs_select_superadmin" on public.system_logs;
create policy "system_logs_select_superadmin"
on public.system_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
  )
);
