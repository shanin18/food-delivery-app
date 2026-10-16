create table public.courier_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  courier_id uuid references auth.users(id) on delete set null,
  order_ref text not null check (char_length(order_ref) between 1 and 120),
  created_at timestamptz not null default now(),
  unique(customer_id, order_ref)
);
create table public.courier_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.courier_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index courier_messages_conversation_time on public.courier_messages(conversation_id, created_at);
create index courier_conversations_courier on public.courier_conversations(courier_id);
alter table public.courier_conversations enable row level security;
alter table public.courier_messages enable row level security;
revoke all on public.courier_conversations, public.courier_messages from anon, authenticated;
grant select, insert on public.courier_conversations, public.courier_messages to authenticated;
create policy "Participants read conversations" on public.courier_conversations for select to authenticated
using (auth.uid() = customer_id or auth.uid() = courier_id);
create policy "Customers start conversations" on public.courier_conversations for insert to authenticated
with check (auth.uid() = customer_id and courier_id is null);
create policy "Participants read messages" on public.courier_messages for select to authenticated
using (exists(select 1 from public.courier_conversations c where c.id = conversation_id and (c.customer_id = auth.uid() or c.courier_id = auth.uid())));
create policy "Participants send messages" on public.courier_messages for insert to authenticated
with check (sender_id = auth.uid() and exists(select 1 from public.courier_conversations c where c.id = conversation_id and (c.customer_id = auth.uid() or c.courier_id = auth.uid())));
-- Courier assignment is restricted to a trusted backend or SQL administrator.
alter publication supabase_realtime add table public.courier_messages;
