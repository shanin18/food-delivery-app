# Food Delivery

Expo SDK 57 / React Native application with customer and restaurant-owner routes.

## Development

Copy `.env.example` to `.env.local` and set the Supabase public URL and publishable key. Keep server credentials outside the app.

```sh
npm ci
npm start
npm run lint
npm run typecheck
npm test
```

## Documentation

- [Authentication](docs/supabase-auth.md)
- [Restaurant accounts](docs/restaurant-accounts.md)
- [Profile photos](docs/profile-photos.md)
- [Courier messaging](docs/courier-chat.md)
- [Production readiness audit](docs/production-readiness.md)

Authentication, profile editing and courier messaging integrate with Supabase. Orders are device-local; restaurant data, payments, payouts and courier tracking still use local or sample implementations. This is not yet a live fulfillment system.
