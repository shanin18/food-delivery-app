begin;

alter table public.restaurants add column delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0);
alter table public.commerce_orders add column checkout_request jsonb;
alter table public.menu_items add constraint menu_price_finite check (price <> 'NaN'::numeric);
alter table public.restaurants add constraint restaurant_fee_finite check (delivery_fee <> 'NaN'::numeric);
alter table public.commerce_orders add constraint order_money_finite
check (subtotal <> 'NaN'::numeric and delivery_fee <> 'NaN'::numeric and total <> 'NaN'::numeric);

-- Every amount comes from database records, never client-supplied totals.
-- Only cash delivery is enabled until payment-provider integration is built.
create function public.create_delivery_order(
  p_restaurant_id uuid,
  p_idempotency_key uuid,
  p_items jsonb,
  p_delivery_address text,
  p_latitude double precision,
  p_longitude double precision
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_request jsonb;
  v_existing public.commerce_orders%rowtype;
  v_restaurant public.restaurants%rowtype;
  v_item public.menu_items%rowtype;
  v_line jsonb;
  v_quantity integer;
  v_subtotal numeric := 0;
  v_order uuid;
  v_count integer;
begin
  if v_user is null then raise exception 'Sign in before ordering' using errcode = '42501'; end if;
  if p_restaurant_id is null or p_idempotency_key is null
    or p_delivery_address is null or char_length(btrim(p_delivery_address)) not between 1 and 500
    or p_latitude is null or not (p_latitude between -85 and 85)
    or p_longitude is null or not (p_longitude between -180 and 180)
  then raise exception 'Invalid delivery details' using errcode = '22023'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be an array' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(p_items);
  if v_count not between 1 and 50 then raise exception 'Choose 1 to 50 items' using errcode = '22023'; end if;
  for v_line in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_line) <> 'object'
      or not (v_line ? 'menu_item_id' and v_line ? 'quantity')
      or (v_line - 'menu_item_id' - 'quantity') <> '{}'::jsonb
      or jsonb_typeof(v_line->'menu_item_id') <> 'string'
      or jsonb_typeof(v_line->'quantity') <> 'number'
      or (v_line->>'quantity') !~ '^[1-9][0-9]?$'
    then raise exception 'Invalid item; provide only menu_item_id and integer quantity 1 to 99' using errcode = '22023'; end if;
    -- Validate UUIDs before sorting and locking rows.
    perform (v_line->>'menu_item_id')::uuid;
  end loop;
  if (select count(distinct (value->>'menu_item_id')::uuid) from jsonb_array_elements(p_items)) <> v_count then
    raise exception 'Duplicate menu items are not allowed' using errcode = '22023';
  end if;
  select jsonb_build_object('restaurant_id', p_restaurant_id, 'items',
    jsonb_agg(value order by (value->>'menu_item_id')::uuid),
    'address', btrim(p_delivery_address), 'latitude', p_latitude, 'longitude', p_longitude)
  into v_request from jsonb_array_elements(p_items);
  -- Serialize retries for the same customer/key, including concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_idempotency_key::text, 0));
  select * into v_existing from public.commerce_orders where customer_id = v_user and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.checkout_request is distinct from v_request then
      raise exception 'This checkout key was used for different details' using errcode = '22023';
    end if;
    return v_existing.id;
  end if;
  select * into v_restaurant from public.restaurants where id = p_restaurant_id for share;
  if not found or not v_restaurant.published or not v_restaurant.accepting_orders then
    raise exception 'Restaurant is not accepting orders' using errcode = '22023';
  end if;
  -- Lock in deterministic order so concurrent edits cannot change snapshots.
  for v_line in select value from jsonb_array_elements(p_items) order by (value->>'menu_item_id')::uuid loop
    select * into v_item from public.menu_items where id = (v_line->>'menu_item_id')::uuid and restaurant_id = p_restaurant_id for share;
    if not found or v_item.archived or not v_item.available or not v_item.delivery then
      raise exception 'A selected item is unavailable for delivery' using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + v_item.price * (v_line->>'quantity')::integer;
  end loop;
  insert into public.commerce_orders(customer_id, restaurant_id, idempotency_key, payment_method, currency, subtotal, delivery_fee, total, delivery_address, latitude, longitude, checkout_request)
  values(v_user, p_restaurant_id, p_idempotency_key, 'cash', v_restaurant.currency, v_subtotal, v_restaurant.delivery_fee, v_subtotal + v_restaurant.delivery_fee, btrim(p_delivery_address), p_latitude, p_longitude, v_request)
  returning id into v_order;
  for v_line in select value from jsonb_array_elements(p_items) loop
    select * into strict v_item from public.menu_items where id = (v_line->>'menu_item_id')::uuid;
    v_quantity := (v_line->>'quantity')::integer;
    insert into public.commerce_order_items(order_id, restaurant_id, menu_item_id, name, quantity, unit_price)
    values(v_order, p_restaurant_id, v_item.id, v_item.name, v_quantity, v_item.price);
  end loop;
  insert into public.commerce_order_events(order_id, actor_id, status) values(v_order, v_user, 'requested');
  return v_order;
end;
$$;

create function public.transition_delivery_order(p_order_id uuid, p_status text)
returns public.commerce_orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order public.commerce_orders%rowtype;
  v_owner boolean;
  v_customer boolean;
  v_courier boolean;
  v_allowed boolean := false;
begin
  if v_user is null then raise exception 'Sign in first' using errcode = '42501'; end if;
  select * into v_order from public.commerce_orders where id = p_order_id for update;
  if not found then raise exception 'Order unavailable' using errcode = '42501'; end if;
  select exists(select 1 from public.restaurants r join public.restaurant_accounts a on a.user_id = r.owner_id where r.id = v_order.restaurant_id and r.owner_id = v_user) into v_owner;
  v_customer := v_order.customer_id = v_user;
  v_courier := coalesce(v_order.courier_id = v_user, false);
  if not (v_owner or v_customer or v_courier) then raise exception 'Order unavailable' using errcode = '42501'; end if;
  if p_status is null or p_status not in ('accepted','preparing','picked_up','delivered','cancelled') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;
  if p_status = v_order.status then return v_order; end if;
  if v_owner then
    v_allowed := (v_order.status = 'requested' and p_status = 'accepted')
      or (v_order.status = 'accepted' and p_status = 'preparing')
      or (v_order.status in ('requested','accepted','preparing') and p_status = 'cancelled');
  end if;
  if v_customer and v_order.status = 'requested' and p_status = 'cancelled' then v_allowed := true; end if;
  if v_courier and ((v_order.status = 'preparing' and p_status = 'picked_up')
    or (v_order.status = 'picked_up' and p_status = 'delivered')) then v_allowed := true; end if;
  if not v_allowed then raise exception 'This order transition is not allowed' using errcode = '42501'; end if;
  if p_status = 'cancelled' and v_order.payment_status <> 'unpaid' then
    raise exception 'Payment reconciliation is required before cancellation' using errcode = '22023';
  end if;
  update public.commerce_orders set status = p_status,
    payment_status = case when p_status = 'delivered' and payment_method = 'cash' then 'paid' else payment_status end
  where id = v_order.id returning * into v_order;
  insert into public.commerce_order_events(order_id, actor_id, status) values(v_order.id, v_user, p_status);
  return v_order;
end;
$$;

revoke all on function public.create_delivery_order(uuid,uuid,jsonb,text,double precision,double precision) from public, anon, authenticated;
revoke all on function public.transition_delivery_order(uuid,text) from public, anon, authenticated;
grant execute on function public.create_delivery_order(uuid,uuid,jsonb,text,double precision,double precision) to authenticated;
grant execute on function public.transition_delivery_order(uuid,text) to authenticated;

commit;
