# Restaurant owner flow

Restaurant owners sign in at `/owner-login`, separately from customer sign-in. The customer Profile menu has no restaurant shortcut. On the customer login screen, “Restaurant owner? Sign in” opens the separate sign-in form.

Apply the full SQL contents of `supabase/migrations/202610160003_restaurant_accounts.sql` once in Supabase SQL Editor. Create a separate owner user in Supabase Authentication, then grant access from SQL Editor:

```sql
insert into public.restaurant_accounts (user_id, restaurant_name, location)
values ('OWNER_AUTH_USER_UUID', 'Rose Garden Restaurant', 'Halal Lab office');
```

Use a distinct account for an owner. Client users cannot create owner grants or change their role via editable user metadata. The restaurant layout queries the signed-in user's membership before rendering its screens. This migration has been prepared locally, not deployed by the coding agent.

## Navigation

- Dashboard grid: statistics and revenue; running/requested counters and their See All links open order panels.
- List tab: My Food List with All/Breakfast/Lunch/Dinner tabs.
- A food row: Food Details → Edit → Save Changes updates the shared owner menu.
- Plus tab: Add New Items → select photos, price, fulfilment, category, ingredients, description → Save Changes.
- Bell: Notifications/Messages tabs. Sample notification messages are read-only until a restaurant messaging backend is connected.
- Person: Restaurant Account, separate from the customer profile menu.

Restaurant menu, requests, revenue and reviews currently use isolated sample/session data. They are not live server records and menu changes reset when the restaurant layout unmounts. Selected photo URIs are session previews, not uploaded food assets. The courier chat database is independent of these sample notifications. A restaurant order/menu database with ownership RLS is still needed for live operations.
