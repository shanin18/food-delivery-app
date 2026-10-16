begin;
create table if not exists public.restaurant_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  restaurant_name text not null,
  location text not null default ''
);
alter table public.restaurant_accounts enable row level security;
revoke all on public.restaurant_accounts from anon, authenticated;
grant select on public.restaurant_accounts to authenticated;
create policy "Owners read own restaurant account" on public.restaurant_accounts
for select to authenticated using (user_id = auth.uid());
-- Owner access must be granted by an administrator, never user-editable metadata.
commit;
