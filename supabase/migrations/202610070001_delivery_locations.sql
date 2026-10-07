begin;

create table if not exists public.delivery_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  updated_at timestamptz not null default now()
);
alter table public.delivery_locations enable row level security;
revoke all on public.delivery_locations from anon;
grant select, insert, update, delete on public.delivery_locations to authenticated;
drop policy if exists "Read own delivery location" on public.delivery_locations;
drop policy if exists "Insert own delivery location" on public.delivery_locations;
drop policy if exists "Update own delivery location" on public.delivery_locations;
drop policy if exists "Delete own delivery location" on public.delivery_locations;
create policy "Read own delivery location" on public.delivery_locations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own delivery location" on public.delivery_locations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own delivery location" on public.delivery_locations
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Delete own delivery location" on public.delivery_locations
  for delete to authenticated using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
commit;
