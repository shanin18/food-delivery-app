# Production readiness audit

Reviewed 2026-10-16: all source modules and route families, import/asset references, migrations, configuration and automated checks. This is a code audit, not a live-service, penetration or physical-device test.

## Verdict

Not ready to accept real orders or payments. Screens cover much of the intended experience, but the shared business backend is largely missing. A single completion percentage would hide that distinction. Six major work areas remain: shared commerce data, transactional checkout, restaurant operations, courier fulfillment, payout accounting and release readiness.

## Flow audit

| Flow | Current implementation | Work required for live use |
| --- | --- | --- |
| Auth | Supabase login/signup, six-digit OTP, recovery and session restoration | Verify live SMTP/templates, rate limits, redirects, social-provider configuration and installed-build recovery |
| Owner access | Server-verified user and RLS-protected membership table | Admin onboarding/revocation; authorize every future business table/RPC, not just routes |
| Personal profile | Auth metadata and avatar bucket integration | Verify deployed storage policies/limits and email-change behavior; account deletion/export/support |
| Addresses | Device-local per-user address book and geocoding | Server sync if needed; service-area and address validation |
| Browse/search | Local catalog, client filtering | Real restaurants/menu/availability/hours, pagination and server search |
| Owner menu | Session-only RestaurantProvider state; local photo URIs | Authorized database CRUD and durable storage uploads; make customer catalog reflect owner edits |
| Cart/favorites | In-memory root provider | Isolate/reset on account changes; persistence as needed; server price/availability validation |
| Checkout | PaymentProvider creates local timestamp order; test cards | Trusted totals/fees, durable order transaction, idempotency, payment provider/webhooks/refunds |
| Customer orders | Device storage; local cancel/complete/rate | Server orders/items/state history, authorized transitions, cancellation policy and linked reviews |
| Restaurant orders | Generated sample orders and revenue | Shared customer-to-owner orders, realtime events and server aggregates |
| Withdrawals | Sample $500 balance and session history | Settled-payment ledger, trusted balance checks, payout onboarding/provider integration and reconciliation |
| Tracking | Fixed route and preview ETA | Assigned courier, live coordinates, order-specific route/ETA and delivery states |
| Chat | Supabase RLS/realtime; manual courier assignment | Real order FK and ownership validation, courier workflow, pagination/rate limits/background push |
| Calls | Map-backed UI and local controls | Voice provider or phone dialing with proper error handling |
| Reviews/notifications | Sample owner reviews/messages; local customer ratings | Durable order-linked reviews/moderation and real notifications/push/unread counts |
| Settings/offers | Limited settings/local popup | Actual preferences and promotion validation; help/privacy/terms/support |

## Specific risks found

1. `providers/food-provider.tsx` and `payment-provider.tsx` mount outside the authenticated route guard. Cart, favorites and masked-card state are not keyed/reset on account changes. Isolate them before multi-account release.
2. `PaymentProvider.confirm` clears the cart before asynchronous local persistence completes. A write failure can lose the checkout record. Replace this with a server-backed idempotent order transaction.
3. Restaurant edits and withdrawals disappear when their provider unmounts. Food photo picker cache URIs are not durable uploads.
4. Chat `order_ref` is free text, not an order foreign key. It cannot prove ownership of a real order.
5. Dashboard confirmations can open from another native modal. Test stacking on both iOS and Android; static checks cannot establish presentation correctness.
6. Shared animated pressables previously produced a reported runtime error. Worklet capture was narrowed, but full device regression checks remain necessary for nested controls, interrupted scrolling taps, disabled/loading states and accessibility.
7. Some sample strings show encoding artifacts. Review visible copy and normalize corrupted names/text.

## Implementation order

1. Define shared restaurant/menu/order/item/payment/address/review/courier schemas, migrations, indexes and RLS. Verify isolation with two customers and two owners.
2. Connect owner menu/photo CRUD and customer browsing to that database.
3. Implement server checkout with trusted prices, stock/service-area checks and idempotent order creation. A cash-on-delivery pilot can defer card processing, but still needs durable orders and fulfillment.
4. Connect owner actions and courier assignment/status/location to the same orders; replace preview tracking/sample notifications.
5. Integrate payments, refunds and payouts where required, keeping server secrets outside the client.
6. Add monitoring, retry/offline handling, backups/recovery, support/account deletion and release acceptance tests.

## Release configuration and external services

`app.json` lacks Android application ID/iOS bundle identifier and configured icon/splash artwork. No EAS build profiles/project configuration are present in this checkout. Configure identity/artwork, production environment and permissions, then build/sign and test installed binaries. See [Expo production builds](https://docs.expo.dev/deploy/build-project/).

Map HTML uses public OSM tiles and CDN-hosted Leaflet. Check visible attribution, identification, HTTP caching and availability. Public OSM tile service has no SLA; choose a suitable hosted service or compliant configuration before scaling. See [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). Address geocoding already has debounce and a bounded 10-minute successful-response cache; service configuration and failure testing remain.

Live Supabase settings, applied migrations, SMTP delivery, deployed RLS, backups, billing limits and logs were not independently verified. Environment secrets were not printed.

## Cleanup

- Removed obsolete `scripts/reset-project.js` and its command, which reset the app to starter files.
- Removed duplicate ESLint runtime dependency entries; retained development versions and synchronized lockfile root metadata.
- Replaced starter README and added explicit test/typecheck commands.
- Static import/require reference scan found no unreferenced non-route source modules or image assets. Preserved platform variants, migrations, tests, email templates and image prompt records.
- Retained native/tooling dependencies whose necessity cannot be decided from source imports alone.

## Verification and limits

All 14 existing tests passed during audit. Final lint/typecheck/tests are reported with the change. SDK compatibility check (`expo install --check`) was blocked by network EACCES/AggregateError; it is unverified. No real charge, payout, delivery, live migration, release binary or physical-device end-to-end test was performed.

Required acceptance run: signup/OTP/recovery; role isolation; menu CRUD/four photos; customer-to-owner checkout; duplicate payment/retry; accept/cancel; courier assignment/message/reconnect; delivery/review/refund; relaunch/offline/account switching; Android/iOS keyboards, safe areas and modal behavior.
