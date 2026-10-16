# Commerce backend: Step 2

## Apply in Supabase

Migration 004 was confirmed applied by the project owner. Do not rerun it.

1. Open `supabase/migrations/202610160005_commerce_functions.sql`, copy its complete contents into a new SQL Editor query, and run it once as administrator.
2. Open `supabase/tests/commerce_access.sql`, copy its complete contents into a second query, and run it as administrator. Prefer a test/staging project. It inserts synthetic customers/owners/courier and fixtures inside a transaction, tests permissions under `anon` and `authenticated`, then rolls everything back. It does not require creating real test accounts. If a test errors, run `ROLLBACK;` before retrying.
3. Success ends with `Commerce access tests passed; all fixtures rolled back`. Do not remove the final rollback or commit the test fixtures.

No app screens switch to these functions in Step 2. Shared menu integration is Step 3; checkout integration is Step 4.

## Functions

`create_delivery_order(p_restaurant_id uuid, p_idempotency_key uuid, p_items jsonb, p_delivery_address text, p_latitude double precision, p_longitude double precision)` returns the order UUID.

Items are an array of objects containing only `menu_item_id` and integer `quantity` (1 through 99). Maximum 50 distinct menu items per request, all from one restaurant. Generate one UUID per checkout and reuse it for retries; changed contents with the same key are rejected. Input prices/totals/customer IDs/payment states are never accepted. Server rows determine prices, currency, delivery fee, user and immutable item snapshots. Creation and first status event are atomic. Requests with unavailable/archived/non-delivery items or unpublished/closed restaurants fail. Locks protect price snapshots and concurrent reuse of an idempotency key.

This function currently creates **cash delivery orders only**. It does not enable card charges, inventory counts/reservations, menu variants, promotions, service-area distance checks or scheduled opening-hour enforcement. Those remain in subsequent steps. Publication and accepting-orders flags must be configured by an administrator; existing restaurants remain unpublished by default.

`transition_delivery_order(p_order_id uuid, p_status text)` returns the updated order row. It locks the order, authenticates participation, checks allowed transitions and writes an event in the same transaction. Repeating the current status does not write another event.

| Actor | Allowed transitions |
| --- | --- |
| Customer | requested → cancelled |
| Restaurant owner | requested → accepted; accepted → preparing; requested/accepted/preparing → cancelled |
| Assigned courier | preparing → picked_up; picked_up → delivered |

Cash delivery completion records payment as paid, representing courier confirmation of collection. Paid/pending/refunded orders cannot use the cancellation shortcut; later payment-provider reconciliation must handle those. Courier assignment is an administrator/backend operation; this migration does not allow clients to self-assign couriers or change money/status columns directly.

## Security and verification

Both functions use a fixed empty `search_path`, fully qualified application tables, explicit `auth.uid()` checks and narrowly granted execution. Anonymous execution and direct client order/event/payment writes remain denied. Numeric NaN values are rejected for prices and order totals.

Executed migrations 003/004/005 and the SQL access suite in an isolated PostgreSQL 15 database. Local bootstrap used minimal Supabase-compatible `auth.users`, `auth.uid()` and API roles. Tests cover two customers, two owners, an assigned courier, anonymous access, address isolation, private menu/photo visibility, menu-write isolation, server totals, item snapshots, retry deduplication, changed retry payloads, invalid inputs and terminal-state behavior.

This verifies PostgreSQL syntax and database behavior against those auth stubs. It does not verify the hosted project's auth triggers, PostgREST exposure, realtime publication, live configuration, network behavior or payment providers. The same SQL test suite must still pass in Supabase. Concurrent-request locking is implemented; the current SQL suite exercises sequential retries rather than parallel-session load.

References: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html).
