# Courier messaging setup

The app uses the existing Supabase client and Postgres Changes subscriptions; no separate socket server or new client key is needed.

## Apply the database migration

Run `supabase/migrations/202610160001_courier_chat.sql` in the project's Supabase SQL Editor, or deploy it with your normal Supabase migration workflow. It creates conversations and messages, restricts reads and sends to conversation participants using RLS, and enables Realtime for messages.

The migration has been prepared locally, not deployed by the coding agent. The app displays a setup error until these tables exist.

## Assign a courier

After a customer checks out and opens messages, the app creates their conversation with no courier assigned. Messages can be saved while waiting, but there is no recipient until assignment.

Assign an actual signed-in courier user from a trusted backend or the SQL Editor:

```sql
update public.courier_conversations
set courier_id = 'COURIER_AUTH_USER_UUID'
where id = 'CONVERSATION_UUID';
```

Client users cannot change participants. Never expose a service-role key in the app.

On the second device, sign in as that courier and open:

```text
fooddelivery://courier-message?conversationId=CONVERSATION_UUID
```

Both participants use the same screen. Customer messages appear on the customer's right; messages from the other participant appear on the left. The generated portrait is presentation artwork, not the assigned user's actual profile photo.

## Verify

1. Apply the migration; sign in on two devices with different accounts.
2. Create the customer's conversation and assign the other account as courier.
3. Open that conversation on both devices; send in both directions.
4. Confirm messages persist after reopening and synchronize after reconnecting.
5. Sign in as an unrelated third user; confirm the conversation is inaccessible.
6. Open the keyboard on Android/iOS and send without hiding it. Try emoji insertion.

The screen loads the latest 200 messages. Earlier history pagination, push notifications, read receipts, a courier assignment UI, and voice calling are not implemented. The map continues to show a route preview; chat does not enable live courier tracking.

Android keyboard resize behavior is configured in `app.json`. Existing native builds may need rebuilding for that config change to take effect.
