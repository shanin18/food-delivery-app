-- Run AFTER migrations 003, 004 and 005, as the SQL Editor administrator.
-- All fixtures and functions in this test are rolled back. No real users needed.
begin;
create function pg_temp.check(p_ok boolean, p_message text) returns void language plpgsql as $$
begin if p_ok is distinct from true then raise exception 'TEST FAILED: %', p_message; end if; end;
$$;
create function pg_temp.reject(p_sql text, p_code text default '42501') returns void language plpgsql as $$
declare v_rejected boolean := false;
begin
  begin execute p_sql;
  exception when others then
    if sqlstate <> p_code then raise exception 'Wrong failure: % / % for %', sqlstate, sqlerrm, p_sql; end if;
    v_rejected := true;
  end;
  if not v_rejected then raise exception 'TEST FAILED: accepted forbidden operation: %', p_sql; end if;
end;
$$;

-- Reserved synthetic identifiers. Abort rather than touching existing users.
select pg_temp.check(not exists(select 1 from auth.users where id::text like 'ee220000-0000-0000-0000-%'), 'Fixture IDs must be unused');
insert into auth.users(id) values
('ee220000-0000-0000-0000-000000000001'), -- customer A
('ee220000-0000-0000-0000-000000000002'), -- customer B
('ee220000-0000-0000-0000-000000000003'), -- owner A
('ee220000-0000-0000-0000-000000000004'), -- owner B
('ee220000-0000-0000-0000-000000000005'); -- courier
insert into public.restaurant_accounts(user_id, restaurant_name) values
('ee220000-0000-0000-0000-000000000003','Test A'),('ee220000-0000-0000-0000-000000000004','Test B');
insert into public.restaurants(id,owner_id,name,published,accepting_orders,delivery_fee) values
('ee220000-0000-0000-0000-000000000010','ee220000-0000-0000-0000-000000000003','Test A',true,true,3),
('ee220000-0000-0000-0000-000000000011','ee220000-0000-0000-0000-000000000004','Test B',false,false,0);
insert into public.menu_items(id,restaurant_id,name,category,price,delivery) values
('ee220000-0000-0000-0000-000000000020','ee220000-0000-0000-0000-000000000010','Test meal','Lunch',12.50,true),
('ee220000-0000-0000-0000-000000000021','ee220000-0000-0000-0000-000000000011','Private meal','Dinner',20,true);
insert into public.menu_photos(menu_item_id,storage_path,position) values
('ee220000-0000-0000-0000-000000000020','test/a.jpg',0),
('ee220000-0000-0000-0000-000000000021','test/b.jpg',0);

set local role anon;
select pg_temp.check((select count(*) from public.restaurants where id::text like 'ee220000-%')=1,'Anon sees only published restaurant');
select pg_temp.check((select count(*) from public.menu_items where id::text like 'ee220000-%')=1,'Anon sees only published menu');
select pg_temp.check((select count(*) from public.menu_photos where storage_path like 'test/%')=1,'Private photos hidden');
select pg_temp.reject($q$select public.create_delivery_order(null,null,'[]','x',0,0)$q$);
select pg_temp.reject('select * from public.commerce_orders');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','ee220000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"ee220000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select pg_temp.reject($q$insert into public.restaurant_accounts(user_id,restaurant_name) values(auth.uid(),'Escalation')$q$);
select pg_temp.reject($q$update public.restaurants set published=true$q$);
select pg_temp.reject($q$insert into public.menu_items(restaurant_id,name,category,price) values('ee220000-0000-0000-0000-000000000010','Attack','Lunch',1)$q$);
select pg_temp.reject($q$insert into public.customer_addresses(customer_id,label,address,latitude,longitude) values('ee220000-0000-0000-0000-000000000002','Home','Wrong owner',0,0)$q$);
insert into public.customer_addresses(customer_id,label,address,latitude,longitude) values(auth.uid(),'Home','Test address',23,90);
select set_config('test.order',public.create_delivery_order('ee220000-0000-0000-0000-000000000010','ee220000-0000-0000-0000-000000000030','[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":2}]','Test address',23,90)::text,true);
select pg_temp.check((select total=28 and subtotal=25 and delivery_fee=3 and payment_method='cash' and payment_status='unpaid' from public.commerce_orders where id=current_setting('test.order')::uuid),'Trusted pricing and cash status');
select pg_temp.check((select quantity=2 and unit_price=12.50 and name='Test meal' from public.commerce_order_items where order_id=current_setting('test.order')::uuid),'Immutable snapshot');
select pg_temp.check(public.create_delivery_order('ee220000-0000-0000-0000-000000000010','ee220000-0000-0000-0000-000000000030','[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":2}]','Test address',23,90)=current_setting('test.order')::uuid,'Retry returns same order');
select pg_temp.check((select count(*) from public.commerce_order_events where order_id=current_setting('test.order')::uuid)=1,'Retry creates no duplicate events');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010','ee220000-0000-0000-0000-000000000030','[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":3}]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010',gen_random_uuid(),'[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":1,"price":0.01}]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010',gen_random_uuid(),'[{"menu_item_id":"ee220000-0000-0000-0000-000000000021","quantity":1}]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000011',gen_random_uuid(),'[{"menu_item_id":"ee220000-0000-0000-0000-000000000021","quantity":1}]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010',gen_random_uuid(),'[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":0}]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010',gen_random_uuid(),'[]','Test address',23,90)$q$,'22023');
select pg_temp.reject($q$select public.create_delivery_order('ee220000-0000-0000-0000-000000000010',gen_random_uuid(),'[{"menu_item_id":"ee220000-0000-0000-0000-000000000020","quantity":1}]','Test address','NaN',90)$q$,'22023');
select pg_temp.reject($q$update public.commerce_orders set total=0$q$);
select pg_temp.reject($q$select public.transition_delivery_order(current_setting('test.order')::uuid,'accepted')$q$);

-- Customer B cannot see or mutate A's orders, snapshots, events or addresses.
select set_config('request.jwt.claim.sub','ee220000-0000-0000-0000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"ee220000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select pg_temp.check((select count(*) from public.commerce_orders where id=current_setting('test.order')::uuid)=0,'Customer isolation');
select pg_temp.check((select count(*) from public.commerce_order_items where order_id=current_setting('test.order')::uuid)=0,'Item isolation');
select pg_temp.check((select count(*) from public.commerce_order_events where order_id=current_setting('test.order')::uuid)=0,'Event isolation');
select pg_temp.check((select count(*) from public.customer_addresses where customer_id='ee220000-0000-0000-0000-000000000001')=0,'Address isolation');
select pg_temp.reject($q$select public.transition_delivery_order(current_setting('test.order')::uuid,'cancelled')$q$);

-- Owner B can see their unpublished menu but cannot access A's orders/menu writes.
select set_config('request.jwt.claim.sub','ee220000-0000-0000-0000-000000000004',true);
select set_config('request.jwt.claims','{"sub":"ee220000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select pg_temp.check((select count(*) from public.menu_items where id='ee220000-0000-0000-0000-000000000021')=1,'Owner sees unpublished menu');
select pg_temp.check((select count(*) from public.commerce_orders where id=current_setting('test.order')::uuid)=0,'Owner isolation');
select pg_temp.reject($q$select public.transition_delivery_order(current_setting('test.order')::uuid,'accepted')$q$);
select pg_temp.reject($q$insert into public.menu_photos(menu_item_id,storage_path,position) values('ee220000-0000-0000-0000-000000000020','attack.jpg',1)$q$);
do $$ declare n integer; begin update public.menu_items set price=1 where id='ee220000-0000-0000-0000-000000000020'; get diagnostics n=row_count; perform pg_temp.check(n=0,'Foreign owner cannot edit menu'); end $$;

-- Owner A can accept/prepare, but cannot deliver or edit money directly.
select set_config('request.jwt.claim.sub','ee220000-0000-0000-0000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"ee220000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select pg_temp.check((select count(*) from public.commerce_orders where id=current_setting('test.order')::uuid)=1,'Correct owner reads order');
select public.transition_delivery_order(current_setting('test.order')::uuid,'accepted');
select public.transition_delivery_order(current_setting('test.order')::uuid,'preparing');
select pg_temp.reject($q$select public.transition_delivery_order(current_setting('test.order')::uuid,'delivered')$q$);
update public.menu_items set price=99 where id='ee220000-0000-0000-0000-000000000020';
select pg_temp.check((select unit_price=12.50 from public.commerce_order_items where order_id=current_setting('test.order')::uuid),'Catalog edits preserve order snapshots');
select pg_temp.reject($q$update public.commerce_orders set courier_id=auth.uid()$q$);
select pg_temp.reject($q$update public.menu_items set price='NaN' where id='ee220000-0000-0000-0000-000000000020'$q$,'23514');

-- Only administrator assignment enables the courier transition path.
reset role;
update public.commerce_orders set courier_id='ee220000-0000-0000-0000-000000000005' where id=current_setting('test.order')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub','ee220000-0000-0000-0000-000000000005',true);
select set_config('request.jwt.claims','{"sub":"ee220000-0000-0000-0000-000000000005","role":"authenticated"}',true);
select public.transition_delivery_order(current_setting('test.order')::uuid,'picked_up');
select public.transition_delivery_order(current_setting('test.order')::uuid,'delivered');
select pg_temp.check((select status='delivered' and payment_status='paid' from public.commerce_orders where id=current_setting('test.order')::uuid),'Courier completes cash order');
select public.transition_delivery_order(current_setting('test.order')::uuid,'delivered');
select pg_temp.check((select count(*) from public.commerce_order_events where order_id=current_setting('test.order')::uuid)=5,'Repeated transition does not duplicate event');
select pg_temp.reject($q$select public.transition_delivery_order(current_setting('test.order')::uuid,'cancelled')$q$);

reset role;
rollback;
select 'Commerce access tests passed; all fixtures rolled back' as result;
