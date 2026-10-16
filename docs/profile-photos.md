# Profile photo setup

Run the full SQL contents of `supabase/migrations/202610160002_profile_avatars.sql` in Supabase SQL Editor once. This creates the public `profile-avatars` bucket with a 5 MB image limit and restricts uploads/deletes to each user's own folder. The migration has not been deployed by the coding agent.

Open Profile → Personal Info → Edit. Tap the orange pencil, select/crop an image, then Save. The image is uploaded and its URL is saved to the signed-in user's Supabase metadata. A failed profile update removes the newly uploaded file.

Profile photos use public URLs. Previously saved photos are not automatically deleted when replaced.

For a custom development build, rebuild after installing `expo-image-picker` and adding its config plugin. Expo Go includes the module. Restart Metro after installing the package.

Verify on a device: picker cancellation, crop preview, successful save/reopen, oversized image rejection, and Bio wrapping/newlines.
