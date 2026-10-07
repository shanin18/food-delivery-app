# Supabase authentication setup

1. Copy `.env.example` to `.env.local`, fill in your project URL and public
   publishable key (legacy anon keys also work), and restart Expo. Never put a
   secret or service-role key in the app.
2. Run `supabase/migrations/202610070001_delivery_locations.sql` in the Supabase
   SQL editor. Row level security restricts each user to their own coordinates.
3. Enable Email authentication and Confirm email. Set minimum password length to
   6 and email OTP length to 6, matching this app. Leave character complexity
   requirements disabled to keep password validation simple.
4. In the Supabase dashboard, open **Authentication > Email Templates** (or
   **Authentication > Emails > Templates**, depending on the dashboard layout).
   Replace each template's entire HTML body and save:
   - **Confirm signup**: paste `supabase/templates/confirmation.html`.
     Subject: `Your Food Delivery verification code`.
   - **Reset password**: paste `supabase/templates/recovery.html`.
     Subject: `Reset your Food Delivery password`.

   These branded templates use the app's orange, navy header, and rounded card
   styling. `{{ .Token }}` displays the actual code; there is no confirmation
   button. Supabase supports email codes between 6 and 10 digits. Keep the
   project's code length at 6 to match the app. Template files in this repository
   are not automatically applied to your hosted Supabase project. After saving,
   request a new email from the app; previously delivered emails do not change.

5. Configure production SMTP with a verified sender domain, OTP expiry, and Auth
   rate limits. Supabase's default email sender is for development. The app's
   resend cooldown does not replace server rate limits.
6. Enable Facebook, Twitter/X and Apple separately and configure their provider
   credentials. Register Supabase's callback URL in each provider console.
   Add `fooddelivery://auth-callback` to Supabase's redirect allowlist. For web,
   allow your exact origin plus `/auth-callback`, including the development URL
   (typically `http://localhost:8081/auth-callback`). Configure the production Site
   URL. Apple uses browser OAuth here and needs Apple developer/key setup.
7. Rebuild the native app after installing modules or changing plugins. Test
   native OAuth in a development build with the app's custom scheme.

## Replace the default sender with custom SMTP

The existing app supports custom SMTP without changing the authentication code.
Supabase generates and verifies the six-digit code; your SMTP provider delivers
the email using the saved confirmation or recovery template.

In **Authentication > Emails > SMTP Settings**, enable custom SMTP and enter:

| Setting | Value |
| --- | --- |
| Sender email | An address authorized by your email provider |
| Sender name | Food Delivery |
| Host | Your provider's SMTP host |
| Port | Your provider's supported SMTP port |
| Username | Your provider's SMTP username |
| Password | Your provider's SMTP password or SMTP API credential |

Save the settings and keep Confirm email enabled. Use the SMTP credentials,
which may differ from your provider login. Complete any required sender/domain
verification with the provider. Keep SMTP credentials in Supabase's server
settings; never add them to `EXPO_PUBLIC_` variables or the mobile app.

After saving, request a new code with Resend. If delivery fails, check the
Supabase Auth logs and your provider's delivery logs for authentication errors,
unverified senders, rate limits, or rejected recipients. Provider sandbox
restrictions can still apply even when custom SMTP is enabled.

The public project key in `.env.local` cannot update these administrative
settings. This repository's template files also need to be saved in the dashboard.

Reference: [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Behavior and limits

Sessions persist in encrypted SecureStore chunks on native and localStorage on
web. Refresh follows the app lifecycle. Passwords and verification codes are
never logged. Full name is stored in editable Auth metadata; never use that
metadata to grant permissions or roles.

Recovery exchanges the code for a session before updating the password. Visiting
a reset route alone cannot create a session; an already signed-in user can also
change their password there. Sign-out removes this device's session. The app
saves coordinates only when Save & Continue is pressed after Access Location;
the detected location is first displayed on an OpenStreetMap preview. Map
coordinates are shared with OpenStreetMap for rendering after permission is
granted. Map tiles require internet access; saving can be retried without
requesting a new GPS fix. This is not a full
street or delivery address, and permission can be skipped.

The `/home` screen is a minimal authenticated destination with email and sign-out.
Catalog, cart, orders, complete street addresses, and account deletion are separate
features. Provider setup and actual live validation are required before release.

## Live acceptance checks

- Register, verify a correct/incorrect/expired code, resend, and retry a duplicate
  registration.
- Sign in with correct/incorrect credentials, restart the app, and sign out.
  Confirm signed-out users cannot access home, reset, or location routes.
- Recover an account, verify its code, save a new password, and check the old
  password no longer works. Test expired codes and resend too.
- Complete and cancel each social provider on iOS, Android, and web, including
  a cold-start redirect back into the native app.
- Grant/deny location, skip, retry, and verify two accounts cannot access one
  another's location rows through the public API.
- Test offline/slow requests and expired sessions. Static checks do not establish
  production readiness without these live checks.

References: [Supabase React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native),
[mobile OAuth](https://supabase.com/docs/guides/auth/native-mobile-deep-linking),
[production checklist](https://supabase.com/docs/guides/deployment/going-into-prod).
