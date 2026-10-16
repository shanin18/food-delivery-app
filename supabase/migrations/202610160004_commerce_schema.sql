-- Run after 202610160003_restaurant_accounts.sql.
-- Orders and financial state are read-only to clients until trusted RPCs exist.
begin;

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.restaurant_accounts(user_id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '',
  location text not null default '',
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  published boolean not null default false,
  accepting_orders boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  category text not null check (category in ('Breakfast', 'Lunch', 'Dinner')),
  price numeric(12,2) not null check (price > 0),
  ingredients text[] not null default '{}',
  pickup boolean not null default true,
  delivery boolean not null default false,
  available boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  check (pickup or delivery),
  unique (id, restaurant_id)
);
create index menu_items_restaurant_category on public.menu_items(restaurant_id, category);

create table public.menu_photos (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  position smallint not null check (position between 0 and 3),
  unique (menu_item_id, position),
  unique (menu_item_id, storage_path)
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (label in ('Home', 'Work', 'Other')),
  address text not null check (char_length(btrim(address)) between 1 and 300),
  street text not null default '',
  postcode text not null default '',
  apartment text not null default '',
  latitude double precision not null check (latitude between -85 and 85),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);
create index customer_addresses_customer on public.customer_addresses(customer_id);

create table public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  courier_id uuid references auth.users(id) on delete set null,
  idempotency_key uuid not null,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'preparing', 'picked_up', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  payment_method text not null check (payment_method in ('cash', 'card')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total numeric(12,2) not null check (total = subtotal + delivery_fee),
  delivery_address text not null check (char_length(btrim(delivery_address)) between 1 and 500),
  latitude double precision not null check (latitude between -85 and 85),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  unique (customer_id, idempotency_key),
  unique (id, restaurant_id)
);
create index commerce_orders_customer_time on public.commerce_orders(customer_id, created_at desc);
create index commerce_orders_restaurant_status on public.commerce_orders(restaurant_id, status, created_at desc);
create index commerce_orders_courier on public.commerce_orders(courier_id) where courier_id is not null;

create table public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  restaurant_id uuid not null,
  menu_item_id uuid not null,
  name text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price numeric(12,2) not null check (unit_price > 0),
  foreign key (order_id, restaurant_id) references public.commerce_orders(id, restaurant_id) on delete cascade,
  foreign key (menu_item_id, restaurant_id) references public.menu_items(id, restaurant_id) on delete restrict
);
create index commerce_order_items_order on public.commerce_order_items(order_id);

create table public.commerce_order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('requested', 'accepted', 'preparing', 'picked_up', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);
create index commerce_order_events_order on public.commerce_order_events(order_id, id);

create table public.restaurant_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique,
  restaurant_id uuid not null,
  customer_id uuid not null references auth.users(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  foreign key (order_id, restaurant_id) references public.commerce_orders(id, restaurant_id) on delete restrict
);
create index restaurant_reviews_restaurant on public.restaurant_reviews(restaurant_id, created_at desc);

alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_photos enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;
alter table public.commerce_order_events enable row level security;
alter table public.restaurant_reviews enable row level security;

revoke all on public.restaurants, public.menu_items, public.menu_photos, public.customer_addresses, public.commerce_orders, public.commerce_order_items, public.commerce_order_events, public.restaurant_reviews from anon, authenticated;
grant select on public.restaurants, public.menu_items, public.menu_photos to anon, authenticated;
grant insert, update on public.menu_items to authenticated;
grant insert, update, delete on public.menu_photos to authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;
grant select on public.commerce_orders, public.commerce_order_items, public.commerce_order_events, public.restaurant_reviews to authenticated;
-- Publication, restaurant provisioning, payments and order transitions require
-- trusted administrative/server operations. Owners cannot change membership,
-- publication, order money/status/customer/courier fields through table writes.

create policy "Read published or owned restaurants" on public.restaurants for select to anon, authenticated
using (published or owner_id = (select auth.uid()));
create policy "Read visible menu items" on public.menu_items for select to anon, authenticated
using (exists (select 1 from public.restaurants r where r.id = restaurant_id and (r.owner_id = (select auth.uid()) or (r.published and not archived and available))));
create policy "Owners add menu items" on public.menu_items for insert to authenticated
with check (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())));
create policy "Owners update menu items" on public.menu_items for update to authenticated
using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())))
with check (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())));
create policy "Read visible menu photos" on public.menu_photos for select to anon, authenticated
using (exists (select 1 from public.menu_items m where m.id = menu_item_id));
create policy "Owners manage menu photos" on public.menu_photos for all to authenticated
using (exists (select 1 from public.menu_items m join public.restaurants r on r.id = m.restaurant_id where m.id = menu_item_id and r.owner_id = (select auth.uid())))
with check (exists (select 1 from public.menu_items m join public.restaurants r on r.id = m.restaurant_id where m.id = menu_item_id and r.owner_id = (select auth.uid())));
create policy "Customers manage own addresses" on public.customer_addresses for all to authenticated
using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
create policy "Participants read orders" on public.commerce_orders for select to authenticated
using (customer_id = (select auth.uid()) or courier_id = (select auth.uid()) or exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())));
create policy "Participants read order items" on public.commerce_order_items for select to authenticated
using (exists (select 1 from public.commerce_orders o where o.id = order_id));
create policy "Participants read order events" on public.commerce_order_events for select to authenticated
using (exists (select 1 from public.commerce_orders o where o.id = order_id));
create policy "Customers and owners read reviews" on public.restaurant_reviews for select to authenticated
using (customer_id = (select auth.uid()) or exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())));

-- Seed one unpublished record for each administrator-approved existing owner.
insert into public.restaurants (owner_id, name, location)
select user_id, restaurant_name, location from public.restaurant_accounts
on conflict (owner_id) do nothing;

commit;
