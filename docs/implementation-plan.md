# Production implementation plan

Source: [production audit](production-readiness.md). Status is based on implemented and verified work, not UI appearance. Database changes remain pending deployment until they are applied and tested in Supabase.

## Step 1 - Account isolation [DONE]

- [x] Reset cart, favorites and masked-card/payment selection when the authenticated user changes without remounting navigation.
- [x] Run lint, typecheck and tests; document physical-device account-switch verification.

Completed 2026-10-16. Added two provider-level regression checks for same-account refresh, account switching, logout and payment selection. All 16 tests pass. Physical-device verification remains part of Step 9/11: switch A to B, verify empty cart/favorites/cards, then verify saved addresses/order history belong to B.

## Step 2 - Shared commerce schema and authorization [IMPLEMENTED; LIVE VERIFICATION PENDING]

- [x] Prepare restaurant/menu/photo/order/item/status/address/review schema with indexes and ownership constraints.
- [x] Add owner/customer RLS and trusted order creation/status-transition functions.
- [x] Execute migrations and two-customer/two-owner authorization tests in isolated PostgreSQL.
- [x] Apply schema migration 004 to Supabase (confirmed successful by user).
- [ ] Apply functions migration 005 and run the SQL access suite in Supabase.

Implemented migration `202610160005_commerce_functions.sql` and `supabase/tests/commerce_access.sql`. Cash checkout uses trusted prices, atomic item snapshots and idempotent requests; status changes enforce customer/owner/assigned-courier permissions. PostgreSQL tests pass with minimal Supabase auth stubs. Hosted deployment/verification is pending, so Step 2 is not yet marked fully DONE. See [instructions and API contract](commerce-backend.md). Existing app screens still use their current data sources until Steps 3/4.

## Step 3 - Persistent restaurant menu

- [ ] Replace owner sample menu with database reads/CRUD.
- [ ] Upload up to four photos to owner-scoped storage; handle progress/errors/deletion.
- [ ] Load customer restaurant/category/search/detail screens from shared inventory.
- [ ] Add pagination, availability, opening hours and query invalidation.

## Step 4 - Durable checkout and orders

- [ ] Calculate prices/fees/stock/service-area eligibility on the backend.
- [ ] Create orders atomically with idempotency; clear cart only after durable success.
- [ ] Connect customer history and restaurant queues to shared orders.
- [ ] Enforce accept/prepare/cancel/complete transitions server-side and subscribe to changes.
- [ ] Add retry, empty, offline and error states across these flows.

## Step 5 - Account data persistence

- [ ] Sync saved addresses and checkout selection per account.
- [ ] Persist cart/favorites as appropriate; validate data on restore.
- [ ] Add durable preferences and review submission for eligible completed orders.

## Step 6 - Payments and refunds

- [ ] Choose provider/currency/region and configure test credentials on the backend.
- [ ] Replace test card form with provider tokenization/SDK.
- [ ] Implement signed webhook handling, duplicate protection and payment reconciliation.
- [ ] Implement cancellation/refund rules and test failures/retries.
- [ ] Verify live credentials separately before enabling real charges.

## Step 7 - Courier fulfillment

- [ ] Implement trusted assignment and courier-side order workflow.
- [ ] Link conversations to real authorized orders.
- [ ] Replace preview route with live courier coordinates and order-specific ETA.
- [ ] Configure suitable map/geocoding service, attribution, caching and failure behavior.
- [ ] Add real calling/dialing, push notifications and background behavior.
- [ ] Add message pagination, reconnection/rate-limit/abuse controls.

## Step 8 - Restaurant financials

- [ ] Derive dashboard/revenue from server order/payment data.
- [ ] Replace sample balance with settlement ledger.
- [ ] Implement payout onboarding, trusted withdrawal checks, provider processing and history.
- [ ] Reconcile payouts and prevent concurrent/double withdrawals.

## Step 9 - Experience enhancements

- [ ] Replace sample reviews/notifications and wire unread counts.
- [ ] Validate promotions on backend; add preferences/help/support.
- [ ] Normalize corrupted display strings and remaining sample content.
- [ ] Verify shared press feedback, modal stacking, keyboards, safe areas and accessibility on Android/iOS.
- [ ] Measure startup/list/image performance on devices; add targeted cache/deduplication only where justified.

## Step 10 - Production security and operations

- [ ] Verify deployed migrations/RLS/storage rules and role revocation.
- [ ] Verify SMTP, templates, OTP/recovery/OAuth and redirect allowlists.
- [ ] Implement account deletion/export, privacy/terms and support channels.
- [ ] Add error monitoring, server logs, backups/recovery, rate limits and operational alerts.
- [ ] Add integration tests for ownership, checkout, payments, fulfillment and refunds.

## Step 11 - Release

- [ ] Resolve SDK compatibility check and run Expo Doctor with network access.
- [ ] Set application IDs, EAS project/profiles, production environment, app icons/splash and permission copy.
- [ ] Build development/preview binaries and run end-to-end tests on Android/iOS.
- [ ] Complete store privacy disclosures, listing assets and staged release checks.
- [ ] Production smoke test and rollback/recovery plan.

## Dependencies requiring user/external configuration

Payment/payout provider selection and credentials; Supabase migration deployment; courier operating model; release IDs/store accounts. Independent coding proceeds while these remain pending. Never mark deployment or live-provider verification done from local checks alone.
